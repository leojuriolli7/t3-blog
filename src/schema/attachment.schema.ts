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

export const deleteAttachmentsSchema = z.object({
  postId: z.string(),
  attachmentId: z.string(),
});

export type DeleteAttachmentInput = z.TypeOf<typeof deleteAttachmentsSchema>;
