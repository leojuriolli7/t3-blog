import z from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Minimum title length is 5")
    .max(256, "Max title length is 256"),
  body: z.string().min(5, "Minimum body length is 5"),
  tags: z
    .string()
    .array()
    .nonempty("Post must have atleast one tag")
    .max(5, "Maximum of 5 tags per post"),
});

export type CreatePostInput = z.TypeOf<typeof createPostSchema>;

export const getPostsSchema = z.object({
  limit: z.number(),
  cursor: z.string().nullish(),
  skip: z.number().optional(),
  userId: z.string().optional(),
  tagId: z.string().optional(),
});

export const getUserPostsSchema = z.object({
  limit: z.number(),
  cursor: z.string().nullish(),
  skip: z.number().optional(),
  userId: z.string(),
});

export const getSinglePostSchema = z.object({
  postId: z.string().uuid(),
});

export const updatePostSchema = z.object({
  title: z.string().max(256, "Max title length is 256").optional(),
  body: z.string().min(10).optional(),
  postId: z.string().uuid(),
});

export type UpdatePostInput = z.TypeOf<typeof updatePostSchema>;
