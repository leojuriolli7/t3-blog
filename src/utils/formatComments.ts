import { Comment, CommentWithChildren } from "@utils/types";

function formatComments(comments: Array<Comment>) {
  const map = new Map();

  const commentsWithChildren: CommentWithChildren[] = comments?.map(
    (comment) => ({ ...comment, children: [] })
  );

  const roots: Array<CommentWithChildren> = commentsWithChildren?.filter(
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
