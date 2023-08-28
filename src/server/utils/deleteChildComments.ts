import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export const deleteChildComments = async (
  commentId: string,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) => {
  const oneLevelDownReplies = await prisma.comment.findMany({
    where: {
      parentId: commentId,
    },
  });

  // If no replies, delete comment.
  if (!oneLevelDownReplies.length) {
    const commentToDelete = await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    });

    if (!!commentToDelete) {
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
    }
  }

  // If has replies, check for other replies inside the replies.
  if (oneLevelDownReplies.length > 0) {
    for (const reply of oneLevelDownReplies) {
      await deleteChildComments(reply.id, prisma);
    }

    // After checking all replies, delete comment.
    const commentToDelete = await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    });

    if (commentToDelete) {
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
    }
  }
};
