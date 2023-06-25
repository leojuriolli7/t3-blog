import type { PrismaClient } from "@prisma/client";
import type { GetFavoritesInput } from "@schema/post.schema";
import { formatPosts } from "@server/utils";

type GetLikedPostsOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: GetFavoritesInput;
};

export const getLikedPostsHandler = async ({
  ctx,
  input,
}: GetLikedPostsOptions) => {
  const query = input?.query;

  const { userId, limit, skip, cursor } = input;
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
      likes: {
        some: {
          dislike: false,
          userId,
        },
      },
      // We don't want to list the user's own posts,
      // as they are liked by the user automatically on creation.
      NOT: {
        userId,
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
