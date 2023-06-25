import { createTRPCRouter } from "@server/trpc";
import { commentRouter } from "./comment/_router";
import { attachmentsRouter } from "./attachments/_router";
import { likeRouter } from "./like/_router";
import { postRouter } from "./post/_router";
import { userRouter } from "./user/_router";
import { scraperRouter } from "./scraper/_router";
import { searchRouter } from "./search/_router";
import { notificationRouter } from "./notification/_router";
import { tagRouter } from "./tag/_router";

export const appRouter = createTRPCRouter({
  comments: commentRouter,
  attachments: attachmentsRouter,
  likes: likeRouter,
  posts: postRouter,
  users: userRouter,
  scraper: scraperRouter,
  search: searchRouter,
  notification: notificationRouter,
  tags: tagRouter,
});

// Export only the type of a router
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
