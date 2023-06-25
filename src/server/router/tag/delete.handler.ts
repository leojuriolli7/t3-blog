import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@env";
import type { PrismaClient } from "@prisma/client";
import type { DeleteTagInput } from "@schema/tag.schema";
import { s3 } from "@server/config/aws";
import { deleteChildComments } from "@server/utils";
import type { Session } from "next-auth";

type DeleteOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: DeleteTagInput;
};

export const deleteHandler = async ({ ctx, input }: DeleteOptions) => {
  const postsWithOneTag = await ctx.prisma.post.findMany({
    where: {
      tags: {
        every: {
          id: input.id,
        },
      },
    },
    include: {
      Comment: true,
      attachments: true,
    },
  });

  await Promise.all(
    postsWithOneTag.map(async (post) => {
      if (post?.Comment?.length) {
        await Promise.all(
          post.Comment.map(async (comment) => {
            await deleteChildComments(comment.id, ctx.prisma);
          })
        );
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

      await ctx.prisma.post.delete({
        where: {
          id: post.id,
        },
      });
    })
  );

  await ctx.prisma.tag.delete({
    where: {
      id: input.id,
    },
  });
};
