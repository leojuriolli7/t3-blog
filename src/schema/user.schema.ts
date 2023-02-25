import z from "zod";

export const getSingleUserSchema = z.object({
  userId: z.string(),
});
