import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { GetSinglePostInput } from "@schema/post.schema";
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
