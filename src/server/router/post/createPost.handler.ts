import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { CreatePostInput } from "@schema/post.schema";
import { isStringEmpty } from "@server/utils";
import * as trpc from "@trpc/server";

type CreatePostOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: CreatePostInput;
};

export const createPostHandler = async ({ ctx, input }: CreatePostOptions) => {
  const inputHasNoTags = !input?.tags?.length;

  if (
    isStringEmpty(input.body) ||
    isStringEmpty(input.title) ||
    inputHasNoTags
  ) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Body, title and tag are required",
    });
  }

  const tooManyTags = input?.tags?.length > 5;
  if (tooManyTags) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Maximum of 5 tags per post",
    });
  }

  const post = await ctx.prisma.post.create({
    data: {
      title: input.title,
      body: input.body,
      tags: {
        connectOrCreate: input.tags.map((tag) => ({
          create: {
            name: tag.name,
            avatar: tag.avatar,
            backgroundImage: tag.backgroundImage,
            description: tag.description,
          },
          where: {
            name: tag.name,
          },
        })),
      },
      user: {
        connect: {
          id: ctx?.session?.user?.id,
        },
      },
      likes: {
        // Automatically like own post on creation.
        create: {
          userId: ctx?.session?.user?.id,
        },
      },
    },
  });

  if (!!input?.link) {
    await ctx.prisma.link.create({
      data: {
        postId: post.id,
        image: input.link?.image,
        title: input.link?.title,
        url: input.link.url,
        description: input.link?.description,
        ...(input.link?.publisher && {
          publisher: input.link?.publisher,
        }),
      },
    });
  }

  if (!!input?.poll?.title && !!input?.poll?.options) {
    await ctx.prisma.poll.create({
      data: {
        postId: post.id,
        title: input.poll.title,
        options: {
          createMany: {
            data: input.poll.options.map((option) => ({
              color: option.color,
              title: option.title,
              postId: post.id,
            })),
          },
        },
      },
    });
  }

  const followers = await ctx.prisma.follows.findMany({
    where: {
      followingId: ctx.session.user.id,
    },
    select: {
      followerId: true,
    },
  });

  const userHasFollowers = !!followers?.length;

  if (userHasFollowers) {
    const followersId = followers?.map((user) => user.followerId);

    const notificationInfo = followersId?.map((id) => ({
      postId: post.id,
      type: "FOLLOWING-POST",
      notifiedId: id,
      notifierId: ctx.session.user.id,
    }));

    // Notify all followers of a new post.
    await ctx.prisma.notification.createMany({
      data: notificationInfo,
    });
  }

  return post;
};
