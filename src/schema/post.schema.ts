import { UPLOAD_MAX_NUMBER_OF_FILES } from "@config/aws";
import z from "zod";

const link = z
  .object({
    image: z.string(),
    title: z.string(),
    url: z.string().url(),
    description: z.string(),
    publisher: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Minimum title length is 5")
    .max(256, "Max title length is 256"),
  body: z.string().min(5, "Minimum body length is 5"),
  link,
  tags: z
    .string()
    .array()
    .nonempty("Post must have atleast one tag")
    .max(5, "Maximum of 5 tags per post"),
  files: z
    .custom<File>((file) => {
      const isFile = file instanceof File;

      return isFile;
    })
    .array()
    .max(
      UPLOAD_MAX_NUMBER_OF_FILES,
      `Maximum of ${UPLOAD_MAX_NUMBER_OF_FILES} files`
    )
    .optional(),
});

export type CreatePostInput = z.TypeOf<typeof createPostSchema>;

export const getPostsSchema = z.object({
  limit: z.number(),
  cursor: z.string().nullish(),
  skip: z.number().optional(),
  userId: z.string().optional(),
  tagId: z.string().optional(),
  filter: z.string().optional(),
});

export const getFollowingPostsSchema = z.object({
  limit: z.number(),
  cursor: z.string().nullish().optional(),
  skip: z.number().optional(),
  userId: z.string().optional(),
  tagId: z.string().optional(),
  filter: z.string().optional(),
});

export const getFavoritesSchema = z.object({
  limit: z.number(),
  cursor: z.string().nullish(),
  skip: z.number().optional(),
  userId: z.string().optional(),
  filter: z.string().optional(),
});

export const getLikedPostsSchema = getFavoritesSchema;

export const getPostsByTagsSchema = z.object({
  tagLimit: z.number(),
  cursor: z.string().nullish(),
  skip: z.number().optional(),
  filter: z.string().optional(),
  query: z.string().optional(),
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
  link,
  tags: z
    .string()
    .array()
    .nonempty("Post must have atleast one tag")
    .max(5, "Maximum of 5 tags per post"),
});

export type UpdatePostInput = z.TypeOf<typeof updatePostSchema>;

export const favoritePostSchema = z.object({
  postId: z.string().uuid(),
  userId: z.string(),
});

export type FavoritePostInput = z.TypeOf<typeof favoritePostSchema>;

export const searchPostsSchema = z.object({
  query: z.string(),
  limit: z.number(),
  cursor: z.string().nullish(),
  skip: z.number().optional(),
  filter: z.string().optional(),
});
