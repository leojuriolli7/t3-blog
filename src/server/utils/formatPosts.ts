import { Session } from "next-auth";
import { Like, Post } from "@prisma/client";
import { markdownToHtml } from "./markdownToHtml";

type PostType =
  | (Post & {
      likes: Like[];
    })
  | null;

// Filter post for likes and dislikes, and liked/dislikedByMe
export function getPostWithLikes<TPostType extends PostType>(
  post: TPostType,
  session?: Session | null
) {
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
}

// Format array of posts converting post body from markdown to HTML.
export async function formatPosts(posts: PostType[], session?: Session | null) {
  const postsWithLikes = posts.map((post) => getPostWithLikes(post, session));

  const formattedPosts = await Promise.all(
    postsWithLikes.map(async (post) => {
      const formattedBody = await markdownToHtml(post?.body || "");

      return {
        ...post,
        body: formattedBody,
      };
    })
  );

  return formattedPosts;
}
