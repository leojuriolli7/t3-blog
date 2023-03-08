import z from "zod";

export const getSingleUserSchema = z.object({
  userId: z.string(),
});

export const deleteUserSchema = z.object({
  userId: z.string(),
});

export const updateUserSchema = z.object({
  name: z.string().max(50, "Max name length is 50").optional(),
  userId: z.string(),
});

export type UpdateUserInput = z.TypeOf<typeof updateUserSchema>;
