import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@env";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { GetSinglePostInput } from "@schema/post.schema";
import { s3 } from "@server/config/aws";
import { deleteChildComments } from "@server/utils";
import * as trpc from "@trpc/server";

type DeletePostOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: GetSinglePostInput;
};

export const deletePostHandler = async ({ ctx, input }: DeletePostOptions) => {
  const isAdmin = ctx.session.user.isAdmin;

  const post = await ctx.prisma.post.findFirst({
    where: {
      id: input.postId,
    },
    include: {
      attachments: true,
      Comment: true,
      tags: {
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      },
    },
  });

  if (post?.userId !== ctx.session.user.id && !isAdmin) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Cannot delete another user's post.",
    });
  }

  if (post?.attachments?.length) {
    await Promise.all(
      post.attachments.map(async (file) => {
        const deleteAttachmentCommand = new DeleteObjectCommand({
          Bucket: env.AWS_S3_ATTACHMENTS_BUCKET_NAME,
          Key: file.id,
        });

        await s3.send(deleteAttachmentCommand);
      })
    );
  }

  if (post?.Comment?.length) {
    await Promise.all(
      post.Comment.map(async (comment) => {
        await deleteChildComments(comment.id, ctx.prisma);
      })
    );
  }

  await ctx.prisma.post.delete({
    where: {
      id: input.postId,
    },
  });

  const tagsToDelete = post?.tags.filter((tag) => tag._count.posts === 1);

  await ctx.prisma.tag.deleteMany({
    where: {
      name: {
        in: tagsToDelete?.map((tag) => tag.name),
      },
    },
  });
};
