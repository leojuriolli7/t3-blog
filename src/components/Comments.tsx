import React from "react";
import { CommentWithChildren } from "@utils/types";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Comment from "./Comment";
import clsx from "clsx";

type Props = { comments?: Array<CommentWithChildren>; collapsed?: boolean };

const Comments: React.FC<Props> = ({ comments, collapsed }) => {
  const [parentRef] = useAutoAnimate();

  return (
    <div
      ref={parentRef}
      className={clsx("w-full flex-col gap-10", collapsed ? "hidden" : "flex")}
    >
      {comments?.map((comment) => {
        return <Comment identifiable key={comment.id} comment={comment} />;
      })}
    </div>
  );
};

export default Comments;
