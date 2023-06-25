import type { PrismaClient } from "@prisma/client";
import type { GetSubscribedTagsInput } from "@schema/tag.schema";
import type { Session } from "next-auth";

type SubscribedOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: GetSubscribedTagsInput;
};

export const subscribedHandler = async ({ ctx, input }: SubscribedOptions) => {
  const tags = await ctx.prisma.tag.findMany({
    where: {
      subscribers: {
        some: {
          id: ctx.session.user.id,
        },
      },
      ...(input.query && {
        AND: {
          name: {
            contains: input.query,
          },
        },
      }),
    },
    take: input.limit + 1,
    skip: input.skip,
    cursor: input.cursor ? { id: input.cursor } : undefined,
  });

  let nextCursor: typeof input.cursor | undefined = undefined;
  if (tags.length > input.limit) {
    const nextItem = tags.pop(); // return the last item from the array
    nextCursor = nextItem?.id;
  }

  return {
    tags,
    nextCursor,
  };
};
