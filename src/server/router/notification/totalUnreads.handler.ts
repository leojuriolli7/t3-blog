import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";

type TotalUnreadsOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
};

export const totalUnreadsHandler = async ({ ctx }: TotalUnreadsOptions) => {
  const unreads = await ctx.prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      notifiedId: ctx.session?.user?.id,
      read: false,
    },
  });

  return unreads.length;
};
