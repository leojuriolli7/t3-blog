import z from "zod";

const type = z.enum(["posts", "comments", "tags", "users"]);

export const searchSchema = z.object({
  query: z.string(),
  type,
  limit: z.number(),
  cursor: z.string().nullish(),
  skip: z.number().optional(),
  truncateComments: z.boolean().optional(),
});

export type SearchFilterTypes = z.TypeOf<typeof type>;
