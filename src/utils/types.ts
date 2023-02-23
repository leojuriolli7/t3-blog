import { AppRouter } from "@server/router/app.router";
import { inferProcedureOutput } from "@trpc/server";

export type TQuery = keyof AppRouter["_def"]["queries"];

export type InferQueryOutput<TRouteKey extends TQuery> = inferProcedureOutput<
  AppRouter["_def"]["queries"][TRouteKey]
>;

export type Comment = InferQueryOutput<"comments.all-comments">[number];

export type CommentWithChildren = Comment & {
  children: Array<CommentWithChildren>;
};

export type Post = InferQueryOutput<"posts.single-post">;
