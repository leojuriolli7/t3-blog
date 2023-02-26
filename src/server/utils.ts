import { Like, Post, User } from "@prisma/client";
import { Session } from "next-auth";

export const getPostWithLikes = (
  post:
    | (Post & {
        likes: Like[];
        user: User;
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
