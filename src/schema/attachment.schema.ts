import z from "zod";

export const createPresignedUrlSchema = z.object({
  postId: z.string(),
  type: z.string(),
  name: z.string(),
  randomKey: z.string(),
});

export const createPresignedAvatarUrlSchema = z.object({
  userId: z.string(),
});

export const createPresignedPostBodyUrlSchema = z.object({
  userId: z.string(),
  randomKey: z.string(),
});
