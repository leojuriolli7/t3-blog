import { Prisma, PrismaClient } from "@prisma/client";

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
