import { trpc } from "@utils/trpc";
import { CommentWithChildren } from "@utils/types";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useUserContext } from "src/context/user.context";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import useGetDate from "src/hooks/useGetDate";
import { toast } from "react-toastify";
import CommentField from "./CommentField";
import ListComments from "./Comments";
import ReactMarkdown from "./ReactMarkdown";
import ShouldRender from "./ShouldRender";
import ActionButton from "./ActionButton";
import EditCommentForm from "./EditCommentForm";

type CommentProps = {
  comment: CommentWithChildren;
};

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [replying, setReplying] = useState(false);
  const user = useUserContext();
  const utils = trpc.useContext();
  const [parentRef] = useAutoAnimate();

  const router = useRouter();
  const postId = router.query.postId as string;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleIsEditing = useCallback(() => setIsEditing((prev) => !prev), []);

  const { date, toggleDateType } = useGetDate(comment?.createdAt);

  const {
    mutate: deleteComment,
    isLoading: deleting,
    error: deleteError,
  } = trpc.useMutation(["comments.delete-comment"], {
    onSuccess: () => {
      // This will refetch the comments.
      utils.invalidateQueries([
        "comments.all-comments",
        {
          postId,
        },
      ]);
    },
  });

  const onClickDeleteComment = useCallback(
    () => deleteComment({ commentId: comment?.id }),
    [deleteComment, comment]
  );

  const toggleReplying = useCallback(
    () => setReplying((previousState) => !previousState),
    []
  );

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError?.message);
    }
  }, [deleteError]);

  useEffect(() => {
    if (!user) setIsEditing(false);
  }, [user]);

  return (
    <div
      ref={parentRef}
      className="w-full flex flex-col gap-5 bg-slate-100 shadow-md p-6 dark:bg-zinc-800"
    >
      <div className="flex w-full justify-between">
        <h3 className="font-medium">{comment.user.name}</h3>

        <p className="cursor-pointer select-none" onClick={toggleDateType}>
          {date}
        </p>
      </div>
      <ShouldRender if={!isEditing}>
        <ReactMarkdown className="prose">{comment.body}</ReactMarkdown>
      </ShouldRender>

      <ShouldRender if={isEditing}>
        <EditCommentForm onFinish={toggleIsEditing} comment={comment} />
      </ShouldRender>

      <div className="relative w-full flex justify-between items-center">
        <ShouldRender if={!isEditing}>
          <button
            onClick={toggleReplying}
            className="w-auto underline text-emerald-500"
          >
            {replying ? "Stop replying" : "Reply"}
          </button>
        </ShouldRender>

        <ShouldRender if={user?.id === comment.userId}>
          <div className="absolute -bottom-2 -right-2 flex gap-2 items-center">
            <ActionButton
              action={isEditing ? "close" : "edit"}
              onClick={toggleIsEditing}
            />

            <ActionButton
              action="delete"
              disabled={deleting}
              onClick={onClickDeleteComment}
            />
          </div>
        </ShouldRender>
      </div>

      {replying && <CommentField parentId={comment.id} />}

      {comment.children && comment.children.length > 0 && (
        <ListComments comments={comment.children} />
      )}
    </div>
  );
};

export default Comment;
