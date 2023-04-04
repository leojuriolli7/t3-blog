import { Session } from "next-auth";
import {
  FavoritesOnUsers,
  Like,
  Link,
  Poll,
  PollOption,
  Post,
  Tag,
  User,
  Attachment,
} from "@prisma/client";
import { markdownToHtml } from "./markdownToHtml";

type PostType =
  | (Post & {
      user: User | null;
      likes: Like[];
      tags?: Tag[];
      link?: Link | null;
      attachments?: Attachment[] | null;
      favoritedBy?: FavoritesOnUsers[] | undefined;
      poll?:
        | (Poll & {
            options: PollOption[];
          })
        | null;
    })
  | null;

// Filter post for likes and dislikes, and liked/dislikedByMe
export const getPostWithLikes = (post: PostType, session?: Session | null) => {
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
