import type { PrismaClient } from "@prisma/client";
import type { GetAllCommentsInput } from "@schema/comment.schema";
import { formatComments, formatDate, markdownToHtml } from "@server/utils";
import * as trpc from "@trpc/server";

type AllCommentsOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: GetAllCommentsInput;
};

export const allCommentsHandler = async ({
  ctx,
  input,
}: AllCommentsOptions) => {
  const { postId } = input;

  try {
    const comments = await ctx.prisma.comment.findMany({
      where: {
        Post: {
          id: postId,
        },
      },
      include: {
        user: true,
        Post: {
          select: {
            userId: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const withFormattedBody = await Promise.all(
      comments.map(async (comment) => {
        const formattedDate = formatDate(comment.createdAt);

        const formattedBody = await markdownToHtml(comment?.body || "", {
          removeLinksAndImages: false,
          truncate: false,
          linkifyImages: true,
        });

        return {
          ...comment,
          body: formattedBody,
          createdAt: formattedDate,
          // By also sendind the markdown body, we avoid having to
          // parse html back to MD when needed.
          markdownBody: comment?.body,
          authorIsOP: comment?.Post?.userId === comment?.userId,
        };
      })
    );

    type CommentType = (typeof withFormattedBody)[0];
    const withChildren = formatComments<CommentType>(withFormattedBody);

    return withChildren;
  } catch (e) {
    console.log("e:", e);
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
    });
  }
};
