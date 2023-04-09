import React from "react";
import { CommentWithChildren } from "@utils/types";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Comment from "./Comment";

type Props = { comments?: Array<CommentWithChildren> };

const Comments: React.FC<Props> = ({ comments }) => {
  const [parentRef] = useAutoAnimate();

  return (
    <div ref={parentRef} className="flex w-full flex-col gap-10">
      {comments?.map((comment) => {
        return <Comment identifiable key={comment.id} comment={comment} />;
      })}
    </div>
  );
};

export default Comments;
