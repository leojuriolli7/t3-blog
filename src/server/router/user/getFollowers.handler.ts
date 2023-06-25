import type { PrismaClient } from "@prisma/client";
import type { GetFollowingInput } from "@schema/user.schema";

type GetFollowersOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: GetFollowingInput;
};

export const getFollowersHandler = async ({
  ctx,
  input,
}: GetFollowersOptions) => {
  const { limit, skip, cursor } = input;

  const followers = await ctx.prisma.follows.findMany({
    take: limit + 1,
    skip: skip,
    cursor: cursor ? { followerId_followingId: cursor } : undefined,
    where: {
      followingId: input.userId,
    },
    include: {
      follower: true,
    },
  });

  let nextCursor: typeof cursor | undefined = undefined;
  if (followers.length > limit) {
    const nextItem = followers.pop(); // return the last item from the array
    nextCursor = {
      followerId: nextItem!.followerId,
      followingId: nextItem!.followingId,
    };
  }

  return {
    followers,
    nextCursor,
  };
};
