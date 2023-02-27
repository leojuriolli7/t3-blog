import { AppRouter } from "@server/router/app.router";
import { inferProcedureOutput } from "@trpc/server";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

export type TQuery = keyof AppRouter["_def"]["queries"];

export type InferQueryOutput<TRouteKey extends TQuery> = inferProcedureOutput<
  AppRouter["_def"]["queries"][TRouteKey]
>;

export type Comment = InferQueryOutput<"comments.all-comments">[number];

export type CommentWithChildren = Comment & {
  children: Array<CommentWithChildren>;
};

export type Post = InferQueryOutput<"posts.single-post">;

// React-hook-form Controller's 'field' type
export type FieldType = ControllerRenderProps<FieldValues, string>;
