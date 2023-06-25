import type { PrismaClient } from "@prisma/client";
import type { DeleteTagInput } from "@schema/tag.schema";
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
