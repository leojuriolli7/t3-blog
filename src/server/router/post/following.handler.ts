import type { PrismaClient } from "@prisma/client";
import { GetFollowingPostsInput } from "@schema/post.schema";
import { formatPosts, getFiltersByInput } from "@server/utils";
import type { Session } from "next-auth";

type FollowingOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: GetFollowingPostsInput;
};

export const followingHandler = async ({ ctx, input }: FollowingOptions) => {
  const posts = await ctx.prisma.post.findMany({
    where: {
      user: {
        followers: {
          some: {
            followerId: ctx?.session?.user?.id,
          },
        },
      },
    },
    include: {
      likes: true,
      user: true,
      link: true,
      tags: true,
    },
    take: input.limit + 1,
    skip: input.skip,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    ...(input?.filter
      ? { orderBy: getFiltersByInput(input?.filter) }
      : {
          orderBy: {
            createdAt: "desc",
          },
        }),
  });

  let nextCursor: typeof input.cursor | undefined = undefined;
  if (posts.length > input.limit) {
    const nextItem = posts.pop(); // return the last item from the array
    nextCursor = nextItem?.id;
  }

  const formattedPosts = await formatPosts(posts);

  return {
    posts: formattedPosts,
    nextCursor,
  };
};
