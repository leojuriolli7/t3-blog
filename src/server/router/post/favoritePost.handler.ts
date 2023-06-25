import type { PrismaClient } from "@prisma/client";
import type { FavoritePostInput } from "@schema/post.schema";
import type { Session } from "next-auth";

type FavoritePostOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: FavoritePostInput;
};

export const favoritePostHandler = async ({
  ctx,
  input,
}: FavoritePostOptions) => {
  const { postId, userId } = input;

  const userHasAlreadyFavoritedPost =
    await ctx.prisma.favoritesOnUsers.findUnique({
      where: {
        userId_postId: {
          postId,
          userId,
        },
      },
    });

  // User is unfavoriting post.
  if (!!userHasAlreadyFavoritedPost) {
    await ctx.prisma.favoritesOnUsers.delete({
      where: {
        userId_postId: {
          postId,
          userId,
        },
      },
    });
  }

  // User is favoriting post.
  if (!userHasAlreadyFavoritedPost) {
    if (input.authorId !== ctx?.session?.user?.id) {
      await ctx.prisma.notification.create({
        data: {
          postId: input.postId,
          notifierId: ctx?.session?.user?.id,
          notifiedId: input.authorId,
          type: "FAVORITE" as const,
        },
      });
    }

    await ctx.prisma.favoritesOnUsers.create({
      data: {
        postId,
        userId,
      },
    });
  }
};
