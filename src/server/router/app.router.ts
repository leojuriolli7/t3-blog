import { createRouter } from "../createRouter";
import { commentRouter } from "./comment.router";
import { attachmentsRouter } from "./attachments.router";
import { likeRouter } from "./like.router";
import { postRouter } from "./post.router";
import { userRouter } from "./user.router";
import { scraperRouter } from "./scraper.router";
import { searchRouter } from "./search.router";
import { notificationRouter } from "./notification.router";

export const appRouter = createRouter()
  .merge("posts.", postRouter)
  .merge("comments.", commentRouter)
  .merge("users.", userRouter)
  .merge("likes.", likeRouter)
  .merge("attachments.", attachmentsRouter)
  .merge("scraper.", scraperRouter)
  .merge("search.", searchRouter)
  .merge("notification.", notificationRouter);

// Export only the type of a router
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
