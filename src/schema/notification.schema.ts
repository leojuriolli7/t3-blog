import * as z from "zod";

export const getNotificationsSchema = z.object({
  read: z.boolean(),
  limit: z.number(),
  cursor: z.string().nullish(),
  skip: z.number().optional(),
});

export const markAsReadSchema = z.object({
  notificationId: z.string(),
});
