import { Like, Post, Tag, User } from "@prisma/client";
import { Session } from "next-auth";

export const getPostWithLikes = (
  post:
    | (Post & {
        user: User | null;
        likes: Like[];
        tags: Tag[];
      })
    | null,
  session?: Session | null
) => {
  const likedByMe =
    post?.likes?.some(
      (like) => like.userId === session?.user.id && !like.dislike
    ) || false;

  const dislikedByMe =
    post?.likes?.some(
      (like) => like.userId === session?.user.id && like.dislike
    ) || false;

  const likes = post?.likes?.filter((like) => !like.dislike);
  const dislikes = post?.likes?.filter((like) => like.dislike);

  return {
    ...post,
    likedByMe,
    dislikedByMe,
    likes: likes?.length || 0,
    dislikes: dislikes?.length || 0,
  };
};

const filters: Record<string, object> = {
  newest: {
    createdAt: "desc",
  },
  oldest: {
    createdAt: "asc",
  },
  liked: {
    likes: {
      _count: "desc",
    },
  },
};

export const getFiltersByInput = (filter?: string) => {
  if (typeof filter === "string") {
    return filters[filter];
  }
};
