import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { UpdatePostInput } from "@schema/post.schema";
import { isStringEmpty } from "@server/utils";
import * as trpc from "@trpc/server";

type UpdatePostOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: UpdatePostInput;
};

export const updatePostHandler = async ({ ctx, input }: UpdatePostOptions) => {
  const isAdmin = ctx.session.user.isAdmin;

  if (!input?.title && !input.body) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "At least one field must be updated",
    });
  }

  if (isStringEmpty(input.body) || isStringEmpty(input.title)) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Body and title cannot be empty",
    });
  }

  const previousPost = await ctx.prisma.post.findFirst({
    where: {
      id: input.postId,
    },
    include: {
      link: true,
      tags: {
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      },
    },
  });

  if (previousPost?.userId !== ctx.session.user.id && !isAdmin) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "You can only update posts created by you.",
    });
  }

  const previousLink = previousPost?.link?.url;
  const userIsDeletingLink = !input?.link?.url && !!previousLink;
  const userIsAddingNewLink = !!input?.link?.url && !!previousLink;
  const userIsCreatingLink = !!input?.link?.url && !previousLink;

  if (userIsDeletingLink || userIsAddingNewLink) {
    await ctx.prisma.link.delete({
      where: {
        postId: input.postId,
      },
    });
  }

  const post = await ctx.prisma.post.update({
    where: {
      id: input.postId,
    },
    data: {
      ...(input.body && {
        body: input.body,
      }),
      ...(input.title && {
        title: input.title,
      }),
      link: {
        ...((userIsAddingNewLink || userIsCreatingLink) &&
          !!input?.link?.url && {
            create: {
              image: input.link?.image,
              title: input.link?.title,
              url: input.link.url,
              description: input.link?.description,
              ...(input.link?.publisher && {
                publisher: input.link?.publisher,
              }),
            },
          }),
      },
    },
  });

  return post;
};
