import z from "zod";

export const createPresignedUrlSchema = z.object({
  postId: z.string(),
  type: z.string(),
  name: z.string(),
  randomKey: z.string(),
});

export type CreatePresignedUrlInput = z.TypeOf<typeof createPresignedUrlSchema>;

export const createPresignedAvatarUrlSchema = z.object({
  userId: z.string(),
});

export type CreatePresignedAvatarUrlInput = z.TypeOf<
  typeof createPresignedAvatarUrlSchema
>;

export const createPresignedTagUrlSchema = z.object({
  tagName: z.string(),
  type: z.enum(["background", "avatar"]),
});

export type CreatePresignedTagUrlInput = z.TypeOf<
  typeof createPresignedTagUrlSchema
>;

export const deleteAttachmentSchema = z.object({
  key: z.string(),
});

export type DeleteAttachmentInput = z.TypeOf<typeof deleteAttachmentSchema>;
