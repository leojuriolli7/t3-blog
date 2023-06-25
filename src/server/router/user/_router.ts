import {
  deleteUserSchema,
  followUserSchema,
  getFollowingFromUserSchema,
  getFollowersSchema,
  getSingleUserSchema,
  updateUserSchema,
} from "@schema/user.schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@server/trpc";

type UserRouterHandlerCache = {
  singleUser?: typeof import("./singleUser.handler").singleUserHandler;
  getFollowing?: typeof import("./getFollowing.handler").getFollowingHandler;
  getFollowers?: typeof import("./getFollowers.handler").getFollowersHandler;
  deleteUser?: typeof import("./deleteUser.handler").deleteUserHandler;
  updateProfile?: typeof import("./updateProfile.handler").updateProfileHandler;
  followUser?: typeof import("./followUser.handler").followUserHandler;
};

const UNSTABLE_HANDLER_CACHE: UserRouterHandlerCache = {};

export const userRouter = createTRPCRouter({
  singleUser: publicProcedure
    .input(getSingleUserSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.singleUser) {
        UNSTABLE_HANDLER_CACHE.singleUser = (
          await import("./singleUser.handler")
        ).singleUserHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.singleUser) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.singleUser({ input, ctx });
    }),

  getFollowing: publicProcedure
    .input(getFollowingFromUserSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.getFollowing) {
        UNSTABLE_HANDLER_CACHE.getFollowing = (
          await import("./getFollowing.handler")
        ).getFollowingHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.getFollowing) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.getFollowing({ input, ctx });
    }),

  getFollowers: publicProcedure
    .input(getFollowersSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.getFollowers) {
        UNSTABLE_HANDLER_CACHE.getFollowers = (
          await import("./getFollowers.handler")
        ).getFollowersHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.getFollowers) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.getFollowers({ input, ctx });
    }),

  deleteUser: protectedProcedure
    .input(deleteUserSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.deleteUser) {
        UNSTABLE_HANDLER_CACHE.deleteUser = (
          await import("./deleteUser.handler")
        ).deleteUserHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.deleteUser) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.deleteUser({ input, ctx });
    }),

  updateProfile: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.updateProfile) {
        UNSTABLE_HANDLER_CACHE.updateProfile = (
          await import("./updateProfile.handler")
        ).updateProfileHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.updateProfile) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.updateProfile({ input, ctx });
    }),

  followUser: protectedProcedure
    .input(followUserSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.followUser) {
        UNSTABLE_HANDLER_CACHE.followUser = (
          await import("./followUser.handler")
        ).followUserHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.followUser) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.followUser({ input, ctx });
    }),
});
