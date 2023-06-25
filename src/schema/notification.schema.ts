import * as z from "zod";

export const getNotificationsSchema = z.object({
  read: z.boolean(),
  limit: z.number(),
  cursor: z.string().nullish(),
  skip: z.number().optional(),
});

export type GetAllInput = z.TypeOf<typeof getNotificationsSchema>;

export const markAsReadSchema = z.object({
  notificationId: z.string(),
});

export type MarkAsReadInput = z.TypeOf<typeof markAsReadSchema>;
