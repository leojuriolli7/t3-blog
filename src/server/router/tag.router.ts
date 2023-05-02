import { createRouter } from "@server/createRouter";
import {
  deleteTagSchema,
  getSingleTagSchema,
  updateTagSchema,
} from "@schema/tag.schema";
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
  .middleware(isLoggedInMiddleware)
  .mutation("update", {
    input: updateTagSchema,
    async resolve({ ctx, input }) {
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
    },
  });
// Delete tag
