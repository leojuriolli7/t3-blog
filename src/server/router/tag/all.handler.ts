import type { PrismaClient } from "@prisma/client";

type AllOptions = {
  ctx: {
    prisma: PrismaClient;
  };
};

export const allHandler = async ({ ctx }: AllOptions) => {
  const tags = ctx.prisma.tag.findMany();

  return tags;
};
