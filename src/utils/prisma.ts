import { PrismaClient } from "@prisma/client";

// Stop prisma creating new client everytime this file is called.
declare global {
  var prisma: PrismaClient | undefined;
}
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
