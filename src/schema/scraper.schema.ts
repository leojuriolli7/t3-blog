import z from "zod";

export const scrapePageSchema = z.object({
  url: z.string().optional(),
});
