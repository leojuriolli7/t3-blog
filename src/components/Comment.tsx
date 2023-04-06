import { trpc } from "@utils/trpc";
import { CommentWithChildren } from "@types/index";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import useGetDate from "@hooks/useGetDate";
import { toast } from "react-toastify";
import { FiExternalLink } from "react-icons/fi";
import CommentField from "./CommentField";
import ListComments from "./Comments";
import ShouldRender from "./ShouldRender";
import ActionButton from "./ActionButton";
import EditCommentForm from "./EditCommentForm";
import { useSession } from "next-auth/react";
import Link from "next/link";
import getUserDisplayName from "@utils/getUserDisplayName";
import HTMLBody from "./HTMLBody";
import ConfirmationModal from "./ConfirmationModal";

type CommentProps = {
  comment: CommentWithChildren;
};

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [replying, setReplying] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const utils = trpc.useContext();
  const [parentRef] = useAutoAnimate();

  const router = useRouter();
  const postId = router.query.postId as string;

  const isDeleteModalOpen = useState(false);
  const [, setIsDeleteModalOpen] = isDeleteModalOpen;

  const showDeleteConfirm = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

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
    if (sessionStatus !== "authenticated") setIsEditing(false);
  }, [sessionStatus]);

  return (
    <div
      ref={parentRef}
      className="w-full flex flex-col gap-5 bg-slate-100 shadow-md p-6 dark:bg-zinc-800"
    >
      <div className="flex w-full justify-between gap-10 sm:gap-0">
        <div className="flex gap-1 items-center">
          <Link
            href={`/users/${comment.userId}`}
            className="font-medium hover:underline"
            title="Visit user profile"
          >
            {getUserDisplayName(comment?.user)}{" "}
          </Link>

          <ShouldRender if={comment.userId === session?.user.id}>
            <span className=" text-emerald-500"> (You)</span>
          </ShouldRender>
        </div>

        <p className="cursor-pointer select-none" onClick={toggleDateType}>
          {date}
        </p>
      </div>
      <ShouldRender if={!isEditing}>
        <HTMLBody className="prose">{comment.body}</HTMLBody>
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

        <ShouldRender if={session?.user?.id === comment.userId}>
          <div className="absolute -bottom-2 -right-2 flex gap-2 items-center">
            <ActionButton
              action={isEditing ? "close" : "edit"}
              onClick={toggleIsEditing}
            />

            <ActionButton action="delete" onClick={showDeleteConfirm} />
          </div>
        </ShouldRender>
      </div>

      {replying && <CommentField parentId={comment.id} />}

      {comment.children && comment.children.length > 0 && (
        <ListComments comments={comment.children} />
      )}

      <ConfirmationModal
        title="Are you sure you want to delete this comment?"
        confirmationLabel="Delete comment"
        openState={isDeleteModalOpen}
        loading={deleting}
        onConfirm={onClickDeleteComment}
      />
    </div>
  );
};

export default Comment;
