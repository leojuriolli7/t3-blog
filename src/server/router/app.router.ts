import { createRouter } from "../createRouter";
import { postRouter } from "./post.router";
import { userRouter } from "./user.router";

export const appRouter = createRouter()
  .merge("users.", userRouter)
  .merge("posts.", postRouter);

// Export only the type of a router
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
