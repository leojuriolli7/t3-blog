import * as z from "zod";

export const getNotificationsSchema = z.object({
  read: z.boolean(),
});
