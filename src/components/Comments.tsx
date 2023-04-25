import React from "react";
import type { CommentWithChildren } from "@utils/types";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Comment from "./Comment";
import clsx from "clsx";

type Props = { comments?: Array<CommentWithChildren>; collapsed?: boolean };

const Comments: React.FC<Props> = ({ comments, collapsed }) => {
  const [parentRef] = useAutoAnimate();

  return (
    <div
      ref={parentRef}
      className={clsx(
        "w-full flex-col gap-4 sm:gap-6",
        collapsed ? "hidden" : "flex"
      )}
    >
      {comments?.map((comment) => {
        return <Comment identifiable key={comment.id} comment={comment} />;
      })}
    </div>
  );
};

export default Comments;
