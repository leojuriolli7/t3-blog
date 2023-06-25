import { createTRPCRouter } from "@server/trpc";
import { commentRouter } from "./comment.router";
import { attachmentsRouter } from "./attachments.router";
import { likeRouter } from "./like.router";
import { postRouter } from "./post.router";
import { userRouter } from "./user.router";
import { scraperRouter } from "./scraper.router";
import { searchRouter } from "./search.router";
import { notificationRouter } from "./notification.router";
import { tagRouter } from "./tag.router";

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
