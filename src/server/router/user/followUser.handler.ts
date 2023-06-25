import type { PrismaClient } from "@prisma/client";
import type { DeleteUserSchema } from "@schema/user.schema";
import type { Session } from "next-auth";

type FollowUserOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: DeleteUserSchema;
};

export const followUserHandler = async ({ ctx, input }: FollowUserOptions) => {
  const followerId = ctx.session.user.id;
  const followingId = input.userId;

  const isUserAlreadyFollowing = await ctx.prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!!isUserAlreadyFollowing) {
    await ctx.prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  if (!isUserAlreadyFollowing) {
    await ctx.prisma.follows.create({
      data: {
        followerId,
        followingId,
      },
    });

    await ctx.prisma.notification.create({
      data: {
        notifierId: followerId,
        notifiedId: followingId,
        type: "FOLLOW" as const,
      },
    });
  }
};
