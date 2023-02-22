import { trpc } from "@utils/trpc";
import { CommentWithChildren } from "@utils/types";
import { format, formatDistance } from "date-fns";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { useUserContext } from "src/context/user.context";
import CommentForm from "./CommentForm";
import ListComments from "./CommentList";

type CommentProps = {
  comment: CommentWithChildren;
};

type Dates = "distance" | "date";

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [replying, setReplying] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<Dates>("distance");
  const isDistance = selectedDateType === "distance";
  const user = useUserContext();
  const utils = trpc.useContext();

  const router = useRouter();
  const postId = router.query.postId as string;

  const { mutate: deleteComment, isLoading } = trpc.useMutation(
    ["comments.delete-comment"],
    {
      onSuccess: () => {
        // This will refetch the comments.
        utils.invalidateQueries([
          "comments.all-comments",
          {
            postId,
          },
        ]);
      },
    }
  );

  const onClickDeleteComment = useCallback(
    () => deleteComment({ commentId: comment?.id }),
    [deleteComment, comment]
  );

  const createdAt: Record<Dates, string> = useMemo(
    () => ({
      distance: formatDistance(comment?.createdAt, new Date(), {
        addSuffix: true,
      }),
      date: format(comment?.createdAt, "dd/MM/yyyy - HH:mm"),
    }),
    [comment]
  );

  const toggleDateType = useCallback(() => {
    setSelectedDateType(isDistance ? "date" : "distance");
  }, [isDistance]);

  const toggleReplying = useCallback(
    () => setReplying((previousState) => !previousState),
    []
  );

  return (
    <div
      className="w-full flex flex-col gap-5 bg-slate-100 shadow-md p-6"
      key={comment.id}
    >
      <div className="flex w-full justify-between">
        <h3 className="font-medium">{comment.user.name}</h3>

        <p className="cursor-pointer" onClick={toggleDateType}>
          {isDistance ? createdAt?.distance : createdAt?.date}
        </p>
      </div>
      <p>{comment.body}</p>

      <div className="w-full flex justify-between">
        <button
          onClick={toggleReplying}
          className="w-auto underline text-emerald-300"
        >
          {replying ? "Stop replying" : "Reply"}
        </button>

        {user?.id === comment.userId && (
          <button
            onClick={onClickDeleteComment}
            className="w-auto underline text-emerald-300"
            disabled={isLoading}
          >
            Delete
          </button>
        )}
      </div>

      {replying && <CommentForm parentId={comment.id} />}

      {comment.children && comment.children.length > 0 && (
        <ListComments comments={comment.children} />
      )}
    </div>
  );
};

export default Comment;
