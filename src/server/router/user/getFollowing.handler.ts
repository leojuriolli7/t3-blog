import type { PrismaClient } from "@prisma/client";
import type { GetFollowingInput } from "@schema/user.schema";

type GetFollowingOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: GetFollowingInput;
};

export const getFollowingHandler = async ({
  ctx,
  input,
}: GetFollowingOptions) => {
  const { limit, skip, cursor } = input;

  const following = await ctx.prisma.follows.findMany({
    take: limit + 1,
    skip: skip,
    cursor: cursor ? { followerId_followingId: cursor } : undefined,
    where: {
      followerId: input.userId,
    },
    include: {
      following: true,
    },
  });

  let nextCursor: typeof cursor | undefined = undefined;
  if (following.length > limit) {
    const nextItem = following.pop(); // return the last item from the array
    nextCursor = {
      followerId: nextItem!.followerId,
      followingId: nextItem!.followingId,
    };
  }

  return {
    following,
    nextCursor,
  };
};
