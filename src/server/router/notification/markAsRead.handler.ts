import type { PrismaClient } from "@prisma/client";
import type { MarkAsReadInput } from "@schema/notification.schema";

type MarkAsReadOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: MarkAsReadInput;
};

export const markAsReadHandler = async ({ ctx, input }: MarkAsReadOptions) => {
  return await ctx.prisma.notification.update({
    where: {
      id: input.notificationId,
    },
    data: {
      read: true,
    },
  });
};
