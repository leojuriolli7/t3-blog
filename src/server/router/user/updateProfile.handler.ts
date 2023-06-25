import * as trpc from "@trpc/server";
import type { UpdateUserInput } from "@schema/user.schema";
import type { Session } from "next-auth";
import type { PrismaClient } from "@prisma/client";
import { isStringEmpty } from "@server/utils";

type UpdateUserOptions = {
  input: UpdateUserInput;
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
};

export const updateProfileHandler = async ({
  input,
  ctx,
}: UpdateUserOptions) => {
  const { userId } = input;
  const isAdmin = ctx?.session?.user?.isAdmin;

  if (isStringEmpty(input.name)) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Name cannot be empty",
    });
  }

  const userToUpdate = await ctx.prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      url: true,
    },
  });

  if (userToUpdate?.id !== ctx?.session?.user?.id && !isAdmin) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "You can only update your own profile.",
    });
  }

  const previousLink = userToUpdate?.url?.url;
  const userIsDeletingLink = !input?.url?.url && !!previousLink;
  const userIsAddingNewLink = !!input?.url?.url && !!previousLink;
  const userIsCreatingLink = !!input?.url?.url && !previousLink;

  if (userIsDeletingLink || userIsAddingNewLink) {
    await ctx.prisma.userLink.delete({
      where: {
        userId: userId,
      },
    });
  }

  const user = await ctx.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...(input.name && {
        name: input.name,
      }),
      bio: input?.bio,
      ...(input?.image && {
        image: input.image,
      }),

      url: {
        ...((userIsAddingNewLink || userIsCreatingLink) &&
          !!input?.url?.url && {
            create: {
              icon: input.url?.icon,
              title: input.url?.title,
              url: input.url?.url,
              ...(input.url?.publisher && {
                publisher: input.url?.publisher,
              }),
            },
          }),
      },
    },
  });
  return user;
};
