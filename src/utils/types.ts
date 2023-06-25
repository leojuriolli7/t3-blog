import type { AppRouter } from "@server/router/app.router";
import type {
  inferProcedureOutput,
  inferRouterInputs,
  inferRouterOutputs,
} from "@trpc/server";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export type CommentWithChildren =
  RouterOutput["comments"]["allComments"][number];

export type SinglePost = RouterOutput["posts"]["singlePost"];

export type PostFromList = RouterOutput["posts"]["all"]["posts"][number];

export type FollowingPosts = RouterOutput["posts"]["following"];
export type TagType = RouterOutput["tags"]["all"][number];

export type SingleTagType = RouterOutput["tags"]["singleTag"];

export type TagWithPosts = RouterOutput["posts"]["byTags"]["tags"][number];

export type TaggedPosts =
  RouterOutput["posts"]["byTags"]["tags"][number]["posts"][number];

export type User = RouterOutput["users"]["singleUser"];
export type UserLink = RouterOutput["users"]["singleUser"]["url"];

export type FollowingUser =
  RouterOutput["users"]["getFollowing"]["following"][number]["following"];

export type Metadata = RouterOutput["scraper"]["scrapeLink"];
export type Poll = RouterOutput["posts"]["singlePost"]["poll"];

export type Notification =
  RouterOutput["notification"]["getAll"]["list"][number];

// React-hook-form Controller's 'field' type
export type FieldType = ControllerRenderProps<FieldValues, string>;
