import type { PrismaClient } from "@prisma/client";
import type { UpdateTagInput } from "@schema/tag.schema";
import type { Session } from "next-auth";

type UpdateOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: UpdateTagInput;
};

export const updateHandler = async ({ ctx, input }: UpdateOptions) => {
  const { avatar, backgroundImage, description, name } = input;

  await ctx.prisma.tag.update({
    data: {
      ...(avatar && { avatar }),
      ...(backgroundImage && { backgroundImage }),
      ...(description && { description }),
      ...(name && { name }),
    },
    where: {
      id: input.id,
    },
  });
};
