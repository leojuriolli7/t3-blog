import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { GetSingleUserInput } from "@schema/user.schema";
import { formatDate } from "@server/utils";

type SingleUserOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session | null;
  };
  input: GetSingleUserInput;
};

export const singleUserHandler = async ({ ctx, input }: SingleUserOptions) => {
  const user = await ctx.prisma.user.findFirst({
    where: {
      id: input.userId,
    },
    include: {
      _count: {
        select: { followers: true, following: true },
      },
      url: true,
    },
  });

  const formattedDate = formatDate(user!.createdAt);

  if (ctx.session?.user?.id) {
    const followerId = ctx.session.user.id;
    const followingId = input.userId;

    const alreadyFollowing = await ctx.prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return {
      ...user,
      createdAt: formattedDate,
      alreadyFollowing: !!alreadyFollowing,
    };
  }

  return {
    ...user,
    createdAt: formattedDate,
    alreadyFollowing: false,
  };
};
