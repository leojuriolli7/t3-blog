import {
  createPostSchema,
  favoritePostSchema,
  getFavoritesSchema,
  getPostsByTagsSchema,
  getPostsSchema,
  getFollowingPostsSchema,
  getSinglePostSchema,
  updatePostSchema,
  getLikedPostsSchema,
  voteOnPollSchema,
  getPostsFromSubbedTagsSchema,
} from "@schema/post.schema";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@server/trpc";

type PostRouterHandlerCache = {
  byTags?: typeof import("./byTags.handler").byTagsHandler;
  following?: typeof import("./following.handler").followingHandler;
  all?: typeof import("./all.handler").allHandler;
  singlePost?: typeof import("./singlePost.handler").singlePostHandler;
  getFavoritePosts?: typeof import("./getFavoritePosts.handler").getFavoritePostsHandler;
  getLikedPosts?: typeof import("./getLikedPosts.handler").getLikedPostsHandler;
  createPost?: typeof import("./createPost.handler").createPostHandler;
  deletePost?: typeof import("./deletePost.handler").deletePostHandler;
  updatePost?: typeof import("./updatePost.handler").updatePostHandler;
  favoritePost?: typeof import("./favoritePost.handler").favoritePostHandler;
  voteOnPoll?: typeof import("./voteOnPoll.handler").voteOnPollHandler;
  subscribed?: typeof import("./subscribed.handler").subscribedHandler;
  yourFeed?: typeof import("./yourFeed.handler").yourFeedHandler;
};

const UNSTABLE_HANDLER_CACHE: PostRouterHandlerCache = {};

export const postRouter = createTRPCRouter({
  byTags: publicProcedure
    .input(getPostsByTagsSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.byTags) {
        UNSTABLE_HANDLER_CACHE.byTags = (
          await import("./byTags.handler")
        ).byTagsHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.byTags) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.byTags({ input, ctx });
    }),
  following: protectedProcedure
    .input(getFollowingPostsSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.following) {
        UNSTABLE_HANDLER_CACHE.following = (
          await import("./following.handler")
        ).followingHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.following) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.following({ input, ctx });
    }),
  all: publicProcedure.input(getPostsSchema).query(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.all) {
      UNSTABLE_HANDLER_CACHE.all = (await import("./all.handler")).allHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.all) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.all({ input, ctx });
  }),
  singlePost: publicProcedure
    .input(getSinglePostSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.singlePost) {
        UNSTABLE_HANDLER_CACHE.singlePost = (
          await import("./singlePost.handler")
        ).singlePostHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.singlePost) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.singlePost({ input, ctx });
    }),
  getFavoritePosts: protectedProcedure
    .input(getFavoritesSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.getFavoritePosts) {
        UNSTABLE_HANDLER_CACHE.getFavoritePosts = (
          await import("./getFavoritePosts.handler")
        ).getFavoritePostsHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.getFavoritePosts) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.getFavoritePosts({ input, ctx });
    }),

  getLikedPosts: publicProcedure
    .input(getLikedPostsSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.getLikedPosts) {
        UNSTABLE_HANDLER_CACHE.getLikedPosts = (
          await import("./getLikedPosts.handler")
        ).getLikedPostsHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.getLikedPosts) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.getLikedPosts({ input, ctx });
    }),
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.createPost) {
        UNSTABLE_HANDLER_CACHE.createPost = (
          await import("./createPost.handler")
        ).createPostHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.createPost) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.createPost({ input, ctx });
    }),
  deletePost: protectedProcedure
    .input(getSinglePostSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.deletePost) {
        UNSTABLE_HANDLER_CACHE.deletePost = (
          await import("./deletePost.handler")
        ).deletePostHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.deletePost) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.deletePost({ input, ctx });
    }),

  updatePost: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.updatePost) {
        UNSTABLE_HANDLER_CACHE.updatePost = (
          await import("./updatePost.handler")
        ).updatePostHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.updatePost) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.updatePost({ input, ctx });
    }),
  favoritePost: protectedProcedure
    .input(favoritePostSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.favoritePost) {
        UNSTABLE_HANDLER_CACHE.favoritePost = (
          await import("./favoritePost.handler")
        ).favoritePostHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.favoritePost) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.favoritePost({ input, ctx });
    }),
  voteOnPoll: protectedProcedure
    .input(voteOnPollSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.voteOnPoll) {
        UNSTABLE_HANDLER_CACHE.voteOnPoll = (
          await import("./voteOnPoll.handler")
        ).voteOnPollHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.voteOnPoll) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.voteOnPoll({ input, ctx });
    }),

  subscribed: protectedProcedure
    .input(getPostsFromSubbedTagsSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.subscribed) {
        UNSTABLE_HANDLER_CACHE.subscribed = (
          await import("./subscribed.handler")
        ).subscribedHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.subscribed) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.subscribed({ input, ctx });
    }),
  // Posts from following users or from subscribed tags.
  yourFeed: protectedProcedure
    .input(getPostsFromSubbedTagsSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.yourFeed) {
        UNSTABLE_HANDLER_CACHE.yourFeed = (
          await import("./yourFeed.handler")
        ).yourFeedHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.yourFeed) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.yourFeed({ input, ctx });
    }),
});
