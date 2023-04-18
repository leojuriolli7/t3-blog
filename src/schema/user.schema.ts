import z from "zod";

export const getSingleUserSchema = z.object({
  userId: z.string(),
});

export const signInWithEmailSchema = z.object({
  email: z.string().email(),
});

export type SignInWithEmailInput = z.TypeOf<typeof signInWithEmailSchema>;

export const deleteUserSchema = z.object({
  userId: z.string(),
});

export const followUserSchema = deleteUserSchema;

export const getFollowingFromUserSchema = z.object({
  limit: z.number(),
  cursor: z
    .object({
      followerId: z.string(),
      followingId: z.string(),
    })
    .nullish(),
  skip: z.number().optional(),
  userId: z.string().optional(),
});
export const getFollowersSchema = getFollowingFromUserSchema;

export const urlSchema = z
  .object({
    icon: z.string(),
    title: z.string(),
    url: z.string().url(),
    publisher: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

export const updateUserSchema = z.object({
  avatar: z
    .custom<File>((file) => {
      const isFile = file instanceof File;

      return isFile;
    })
    .optional(),
  image: z.string().optional(),
  name: z.string().max(50, "Max name length is 50").optional(),
  url: urlSchema,
  bio: z.string().max(160, "Max bio length is 160").optional(),
});

export type UpdateUserInput = z.TypeOf<typeof updateUserSchema>;
