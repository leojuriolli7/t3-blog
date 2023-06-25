import * as trpc from "@trpc/server";
import { formatDate, getFiltersByInput, markdownToHtml } from "@server/utils";
import type { PrismaClient } from "@prisma/client";
import type { GetUserCommentsInput } from "@schema/comment.schema";

type UserCommentsOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: GetUserCommentsInput;
};

export const userCommentsHandler = async ({
  ctx,
  input,
}: UserCommentsOptions) => {
  const { userId, limit, skip, cursor } = input;

  try {
    const comments = await ctx.prisma.comment.findMany({
      take: limit + 1,
      skip: skip,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        userId,
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
      ...(input?.filter
        ? { orderBy: getFiltersByInput(input?.filter, true) }
        : {
            orderBy: {
              createdAt: "desc",
            },
          }),
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (comments.length > limit) {
      const nextItem = comments.pop(); // return the last item from the array
      nextCursor = nextItem?.id;
    }

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
          markdownBody: comment.body,
          authorIsOP: comment?.Post?.userId === comment?.userId,
          children: [],
        };
      })
    );

    return { comments: withFormattedBody, nextCursor };
  } catch (e) {
    console.log("e:", e);
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
    });
  }
};
