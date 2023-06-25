import type { PrismaClient } from "@prisma/client";
import type { GetPostsByTagsInput } from "@schema/post.schema";
import { formatPosts } from "@server/utils";

type ByTagsOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: GetPostsByTagsInput;
};

export const byTagsHandler = async ({ ctx, input }: ByTagsOptions) => {
  const { tagLimit, cursor, skip } = input;

  const query = input?.query;

  const tags = await ctx.prisma.tag.findMany({
    take: tagLimit + 1,
    skip: skip,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      _count: {
        select: { posts: true },
      },
      posts: {
        take: 5,
        include: {
          user: true,
          likes: true,
          tags: true,
          link: true,
        },
      },
    },
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
    ...(query && {
      where: {
        OR: [
          {
            description: {
              search: query,
            },
          },
          {
            name: {
              search: query,
            },
          },
        ],
      },
    }),
  });

  let nextCursor: typeof cursor | undefined = undefined;
  if (tags.length > tagLimit) {
    const nextItem = tags.pop(); // return the last item from the array
    nextCursor = nextItem?.id;
  }

  const tagsWithPosts = await Promise.all(
    tags.map(async (tag) => {
      const posts = tag.posts;
      const formattedPosts = await formatPosts(posts);

      return {
        ...tag,
        posts: formattedPosts,
      };
    })
  );

  return {
    tags: tagsWithPosts,
    nextCursor,
  };
};
