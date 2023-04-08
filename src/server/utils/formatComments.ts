import { Comment } from "@prisma/client";

type WithChildren<T> = T & {
  children: Array<WithChildren<T>>;
};

/**
 * Format comments from the database and group them with their
 * children/parents before sending to the client.
 */
function formatComments<T extends Comment>(comments: Array<T>) {
  const map = new Map();

  const commentsWithChildren: WithChildren<T>[] = comments?.map((comment) => ({
    ...comment,
    children: [],
  }));

  const roots: Array<WithChildren<T>> = commentsWithChildren?.filter(
    (comment) => comment.parentId === null
  );

  commentsWithChildren?.forEach((comment, i) => {
    map.set(comment.id, i);
  });

  for (let i = 0; i < comments.length; i++) {
    if (typeof commentsWithChildren[i]?.parentId === "string") {
      const parentCommentIndex = map.get(commentsWithChildren[i].parentId);

      commentsWithChildren[parentCommentIndex]?.children.push(
        commentsWithChildren[i]
      );

      continue;
    }

    continue;
  }

  return roots;
}

export default formatComments;
