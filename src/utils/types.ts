import { AppRouter } from "@server/router/app.router";
import { inferProcedureOutput } from "@trpc/server";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

export type TQuery = keyof AppRouter["_def"]["queries"];

export type InferQueryOutput<TRouteKey extends TQuery> = inferProcedureOutput<
  AppRouter["_def"]["queries"][TRouteKey]
>;

export type CommentWithChildren =
  InferQueryOutput<"comments.all-comments">[number];

export type SinglePost = InferQueryOutput<"posts.single-post">;

export type PostFromList = InferQueryOutput<"posts.posts">["posts"][number];

export type FollowingPosts = InferQueryOutput<"posts.following-posts">;

export type TaggedPosts =
  InferQueryOutput<"posts.posts-by-tags">["tags"][number]["posts"][number];

export type User = InferQueryOutput<"users.single-user">;
export type UserLink = InferQueryOutput<"users.single-user">["url"];

export type FollowingUser =
  InferQueryOutput<"users.get-following">["following"][number]["following"];

export type Metadata = InferQueryOutput<"scraper.scrape-link">;
export type Poll = InferQueryOutput<"posts.single-post">["poll"];

// React-hook-form Controller's 'field' type
export type FieldType = ControllerRenderProps<FieldValues, string>;
