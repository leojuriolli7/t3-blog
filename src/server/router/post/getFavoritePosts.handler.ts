import type { PrismaClient } from "@prisma/client";
import type { GetFavoritesInput } from "@schema/post.schema";
import { formatPosts } from "@server/utils";

type GetFavoritePostsOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: GetFavoritesInput;
};

export const getFavoritePostsHandler = async ({
  ctx,
  input,
}: GetFavoritePostsOptions) => {
  const { userId, limit, skip, cursor } = input;
  const query = input?.query;

  const posts = await ctx.prisma.post.findMany({
    take: limit + 1,
    skip: skip,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      user: true,
      likes: true,
      tags: true,
      link: true,
    },
    where: {
      favoritedBy: {
        some: {
          userId,
        },
      },
      ...(query && {
        OR: [
          {
            title: {
              search: query,
            },
          },
          {
            body: {
              search: query,
            },
          },
        ],
      }),
    },
  });

  let nextCursor: typeof cursor | undefined = undefined;
  if (posts.length > limit) {
    const nextItem = posts.pop(); // return the last item from the array
    nextCursor = nextItem?.id;
  }

  const formattedPosts = await formatPosts(posts);

  return {
    posts: formattedPosts,
    nextCursor,
  };
};
