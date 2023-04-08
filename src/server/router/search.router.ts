import { searchSchema } from "@schema/search.schema";
import { createRouter } from "@server/createRouter";
import { formatComments, formatPosts } from "@server/utils";
import { markdownToHtml } from "@server/utils/markdownToHtml";
import * as trpc from "@trpc/server";

export const searchRouter = createRouter().query("by-type", {
  input: searchSchema,
  async resolve({ ctx, input }) {
    const { limit, skip, cursor, query, type } = input;

    const fetchTags = async () => {
      const tags = await ctx.prisma.tag.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          name: {
            search: input.query,
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (tags.length > limit) {
        const nextItem = tags.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        tags,
        nextCursor,
      };
    };

    const fetchPosts = async () => {
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          body: {
            search: input.query,
          },
          OR: {
            title: {
              search: input.query,
            },
          },
        },
        include: {
          user: true,
          likes: true,
          tags: true,
          link: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const formattedPosts = await formatPosts(posts);

      return {
        posts: formattedPosts,
        nextCursor,
      };
    };

    const fetchUsers = async () => {
      const users = await ctx.prisma.user.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          name: {
            search: query,
          },
        },
        include: {
          _count: {
            select: { followers: true, following: true },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (users.length > limit) {
        const nextItem = users.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        users,
        nextCursor,
      };
    };

    const fetchComments = async () => {
      const comments = await ctx.prisma.comment.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          body: {
            search: query,
          },
        },
        include: {
          user: true,
          Post: {
            select: {
              userId: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (comments.length > limit) {
        const nextItem = comments.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const withFormattedBody = await Promise.all(
        comments.map(async (comment) => {
          const formattedBody = await markdownToHtml(comment?.body || "", {
            removeLinksAndImages: false,
            truncate: false,
            linkifyImages: true,
          });

          return {
            ...comment,
            body: formattedBody,
            markdownBody: comment.body,
            authorIsOP: comment?.Post?.userId === comment?.userId,
            children: [],
          };
        })
      );

      return { comments: withFormattedBody, nextCursor };
    };

    try {
      if (type === "tags") {
        const fetchedTags = await fetchTags();

        return {
          type: "tags" as const,
          tags: fetchedTags.tags,
          nextCursor: fetchedTags.nextCursor,
        };
      }

      if (type === "comments") {
        const fetchedComments = await fetchComments();
        return {
          type: "comments" as const,
          comments: fetchedComments.comments,
          nextCursor: fetchedComments.nextCursor,
        };
      }

      if (type === "posts") {
        const fetchedPosts = await fetchPosts();
        return {
          type: "posts" as const,
          posts: fetchedPosts.posts,
          nextCursor: fetchedPosts.nextCursor,
        };
      }

      if (type === "users") {
        const fetchedUsers = await fetchUsers();

        return {
          type: "users" as const,
          users: fetchedUsers.users,
          nextCursor: fetchedUsers.nextCursor,
        };
      }
    } catch (e) {
      console.log("e:", e);
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
      });
    }
  },
});
