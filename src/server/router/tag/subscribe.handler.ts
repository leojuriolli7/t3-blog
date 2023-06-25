import type { PrismaClient } from "@prisma/client";
import type { GetSingleTagInput } from "@schema/tag.schema";
import type { Session } from "next-auth";

type SubscribeOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: GetSingleTagInput;
};

export const subscribeHandler = async ({ ctx, input }: SubscribeOptions) => {
  const tag = await ctx.prisma.user.findFirst({
    where: {
      id: ctx.session.user.id,
    },
    select: {
      subscribedTags: {
        where: {
          id: input.tagId,
        },
      },
    },
  });

  const isAlreadyFollowingTag = !!tag?.subscribedTags?.length;

  // user is unsubscribing from tag
  if (isAlreadyFollowingTag) {
    await ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        subscribedTags: {
          disconnect: {
            id: input.tagId,
          },
        },
      },
    });
  }

  // user is subscribing to the tag
  if (!isAlreadyFollowingTag) {
    await ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        subscribedTags: {
          connect: {
            id: input.tagId,
          },
        },
      },
    });
  }
};
