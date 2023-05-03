import z from "zod";
import { fileSchema } from "./constants";

export const singleTagSchema = z.object({
  name: z.string().max(50, "Maximum of 50 characters"),
  id: z.string(),
  description: z
    .string()
    .min(3, "Minimum of 3 characters")
    .max(256, "Maximum of 256 characters"),
  avatar: z.string().nonempty("Required"),
  backgroundImage: z.string().nonempty("Required"),
  avatarFile: fileSchema.optional(),
  backgroundImageFile: fileSchema.optional(),
});

export const getSingleTagSchema = z.object({
  tagId: z.string(),
});

export const tagsSchema = singleTagSchema
  .array()
  .nonempty("Post must have at least one tag")
  .max(5, "Maximum of 5 tags per post");

export const createTagSchema = singleTagSchema;
export type CreateTagInput = z.TypeOf<typeof createTagSchema>;

export const deleteTagSchema = z.object({
  id: z.string(),
});

export const updateTagSchema = singleTagSchema;
