import z from "zod";

export const createCommentSchema = z.object({
  body: z.string().min(2, "Minimum comment length is 2"),
  postId: z.string().uuid(),
  parentId: z.string().optional(),
});

export type CreateCommentInput = z.TypeOf<typeof createCommentSchema>;

export const getCommentsSchema = z.object({
  postId: z.string().uuid(),
});

export const deleteCommentSchema = z.object({
  commentId: z.string(),
});

export const updateCommentSchema = z.object({
  body: z.string().min(2, "Minimum comment length is 2"),
  commentId: z.string(),
});

export type UpdateCommentInput = z.TypeOf<typeof updateCommentSchema>;
