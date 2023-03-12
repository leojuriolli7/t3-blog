import {
  FavoritesOnUsers,
  Like,
  Post,
  Prisma,
  PrismaClient,
  Tag,
  User,
} from "@prisma/client";
import { Session } from "next-auth";

export const getPostWithLikes = (
  post:
    | (Post & {
        user: User | null;
        likes: Like[];
        tags?: Tag[];
        favoritedBy?: FavoritesOnUsers[] | undefined;
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

export const deleteChildComments = async (
  commentId: string,
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >
) => {
  const oneLevelDownReplies = await prisma.comment.findMany({
    where: {
      parentId: commentId,
    },
  });

  // If no replies, delete comment.
  if (!oneLevelDownReplies.length) {
    return await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
  }

  // If has replies, check for other replies inside the replies.
  if (oneLevelDownReplies.length > 0) {
    for (const reply of oneLevelDownReplies) {
      await deleteChildComments(reply.id, prisma);
    }

    // After checking all replies, delete comment.
    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
  }
};
