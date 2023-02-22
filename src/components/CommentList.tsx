import React from "react";
import { CommentWithChildren } from "@utils/types";
import Comment from "./Comment";

type Props = { comments: Array<CommentWithChildren> };

const CommentList: React.FC<Props> = ({ comments }) => {
  return (
    <div className="flex w-full flex-col gap-10">
      {comments.map((comment) => {
        return <Comment key={comment.id} comment={comment} />;
      })}
    </div>
  );
};

export default CommentList;
