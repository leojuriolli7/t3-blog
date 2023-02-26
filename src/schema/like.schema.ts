import z from "zod";

export const likePostSchema = z.object({
  postId: z.string().uuid(),
  dislike: z.boolean().default(false),
});
