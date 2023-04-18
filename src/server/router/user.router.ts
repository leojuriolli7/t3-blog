import * as trpc from "@trpc/server";
import { createRouter } from "@server/createRouter";
import {
  deleteUserSchema,
  followUserSchema,
  getFollowingFromUserSchema,
  getFollowersSchema,
  getSingleUserSchema,
  updateUserSchema,
} from "@schema/user.schema";
import { isStringEmpty } from "@utils/checkEmpty";
import { isLoggedInMiddleware } from "@server/utils/isLoggedInMiddleware";

export const userRouter = createRouter()
  .query("single-user", {
    input: getSingleUserSchema,
    async resolve({ ctx, input }) {
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
          alreadyFollowing: !!alreadyFollowing,
        };
      }

      return {
        ...user,
        alreadyFollowing: false,
      };
    },
  })
  .query("get-following", {
    input: getFollowingFromUserSchema,
    async resolve({ ctx, input }) {
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
    },
  })
  .query("get-followers", {
    input: getFollowersSchema,
    async resolve({ ctx, input }) {
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
    },
  })
  .middleware(isLoggedInMiddleware)
  .mutation("delete-user", {
    input: deleteUserSchema,
    async resolve({ ctx, input }) {
      if (ctx.session?.user.id !== input.userId) {
        throw new trpc.TRPCError({
          code: "UNAUTHORIZED",
          message: "You cannot delete another user's account.",
        });
      }

      if (ctx.session?.user.id === input.userId) {
        const deleteUser = ctx.prisma.user.delete({
          where: {
            id: input.userId,
          },
          include: {
            accounts: true,
          },
        });

        await ctx.prisma.$transaction([deleteUser]);
      }
    },
  })
  .mutation("update-profile", {
    input: updateUserSchema,
    async resolve({ ctx, input }) {
      const userId = ctx?.session?.user?.id;

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

      if (userToUpdate?.id !== userId) {
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
    },
  })
  .mutation("follow-user", {
    input: followUserSchema,
    async resolve({ ctx, input }) {
      const followerId = ctx.session!.user!.id;
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
      }
    },
  });
