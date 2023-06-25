import type { PrismaClient } from "@prisma/client";
import type { GetPostsInput } from "@schema/post.schema";
import { formatPosts, getFiltersByInput } from "@server/utils";

type AllHandlerOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: GetPostsInput;
};

export const allHandler = async ({ ctx, input }: AllHandlerOptions) => {
  const { limit, skip, cursor, filter } = input;

  const posts = await ctx.prisma.post.findMany({
    take: limit + 1,
    skip: skip,
    cursor: cursor ? { id: cursor } : undefined,
    ...(filter
      ? { orderBy: getFiltersByInput(filter) }
      : {
          orderBy: {
            createdAt: "desc",
          },
        }),
    include: {
      user: true,
      likes: true,
      tags: true,
      link: true,
    },
    ...(input.userId && {
      where: {
        userId: input.userId,
      },
    }),
    ...(input.tagId && {
      where: {
        tags: {
          some: {
            id: input.tagId,
          },
        },
        ...(input.query && {
          body: {
            search: input.query,
          },
        }),
      },
    }),
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
