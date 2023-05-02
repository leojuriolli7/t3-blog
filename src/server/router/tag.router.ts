import { createRouter } from "@server/createRouter";
import { deleteTagSchema, getSingleTagSchema } from "@schema/tag.schema";
import { isLoggedInMiddleware } from "@server/utils";

export const tagRouter = createRouter()
  .query("all", {
    resolve({ ctx }) {
      const tags = ctx.prisma.tag.findMany();

      return tags;
    },
  })
  .query("single-tag", {
    input: getSingleTagSchema,
    async resolve({ ctx, input }) {
      const tag = ctx.prisma.tag.findFirst({
        where: {
          id: input.tagId,
        },
      });

      return tag;
    },
  })
  .middleware(isLoggedInMiddleware);
// Update tag
// Delete tag
