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

export const updateUserSchema = z.object({
  name: z.string().max(50, "Max name length is 50").optional(),
  userId: z.string(),
  bio: z.string().max(160, "Max bio length is 160").optional(),
});

export type UpdateUserInput = z.TypeOf<typeof updateUserSchema>;
