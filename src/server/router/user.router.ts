import { createRouter } from "@server/createRouter";
import { getSingleUserSchema } from "src/schema/user.schema";

export const userRouter = createRouter().query("single-post", {
  input: getSingleUserSchema,
  resolve({ ctx, input }) {
    return ctx.prisma.user.findUnique({
      where: {
        id: input.userId,
      },
    });
  },
});
