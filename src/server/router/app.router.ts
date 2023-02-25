import { createRouter } from "../createRouter";
import { commentRouter } from "./comment.router";
import { postRouter } from "./post.router";
import { userRouter } from "./user.router";

export const appRouter = createRouter()
  .merge("posts.", postRouter)
  .merge("comments.", commentRouter)
  .merge("users.", userRouter);

// Export only the type of a router
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
