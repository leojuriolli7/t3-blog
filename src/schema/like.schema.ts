import z from "zod";

export const likePostSchema = z.object({
  postId: z.string().uuid(),
  authorId: z.string(),
  dislike: z.boolean().default(false),
});
