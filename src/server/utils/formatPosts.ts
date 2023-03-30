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
} from "@prisma/client";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeCode from "rehype-highlight";
import rehypeRewrite from "rehype-rewrite";
import { Root, RootContent } from "hast";

type PostType =
  | (Post & {
      user: User | null;
      likes: Like[];
      tags?: Tag[];
      link?: Link | null;
      favoritedBy?: FavoritesOnUsers[] | undefined;
      poll?:
        | (Poll & {
            options: PollOption[];
          })
        | null;
    })
  | null;

// Parse post body (markdown) to HTML.
export async function markdownToHtml(markdown: string, rewriteLinks = true) {
  const result = await remark()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeCode)
    .use(
      rehypeRewrite,
      rewriteLinks
        ? {
            rewrite: (node) => {
              // Rewrites any `<a>` to `<p>` to avoid any hydration or
              // validate DOM nesting errors.
              if (
                node.type === "element" &&
                node.tagName === "a" &&
                rewriteLinks
              ) {
                node.tagName = "p";
              }

              // Add aria-label to `<input type='checkbox'>`
              if (
                node.type === "element" &&
                node.tagName === "input" &&
                node?.properties?.type === "checkbox"
              ) {
                node.properties["aria-label"] = "Checkbox from checklist";
              }
            },
          }
        : false
    )
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}

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
