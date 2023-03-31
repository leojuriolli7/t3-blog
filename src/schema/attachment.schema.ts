import z from "zod";

export const getPostAttachments = z.object({
  postId: z.string(),
});

export type GetPostAttachmentsInput = z.TypeOf<typeof getPostAttachments>;

export const createPresignedUrlSchema = z.object({
  postId: z.string(),
  type: z.string(),
  name: z.string(),
});

export const createPresignedAvatarUrlSchema = z.object({
  userId: z.string(),
});

export const createPresignedPostBodyUrlSchema = z.object({
  userId: z.string(),
  randomKey: z.string(),
});
