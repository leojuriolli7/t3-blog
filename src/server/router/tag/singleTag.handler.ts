import type { PrismaClient } from "@prisma/client";
import type { GetSingleTagInput } from "@schema/tag.schema";
import type { Session } from "next-auth";

type SingleTagOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session | null;
  };
  input: GetSingleTagInput;
};

export const singleTagHandler = async ({ ctx, input }: SingleTagOptions) => {
  const tag = await ctx.prisma.tag.findFirst({
    where: {
      id: input.tagId,
    },
    include: {
      subscribers: {
        where: {
          id: ctx?.session?.user?.id,
        },
      },
      _count: {
        select: {
          subscribers: true,
        },
      },
    },
  });

  const isSubscribed = !!tag?.subscribers?.length;

  return {
    ...tag,
    isSubscribed,
  };
};
