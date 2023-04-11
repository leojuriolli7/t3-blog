import { trpc } from "@utils/trpc";
import { CommentWithChildren } from "@utils/types";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import useGetDate from "@hooks/useGetDate";
import { toast } from "react-toastify";
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
import Skeleton from "./Skeleton";

type CommentProps = {
  comment?: CommentWithChildren;
  compact?: boolean;
  outlined?: boolean;
  identifiable?: boolean;
  hideReplies?: boolean;
  loading?: boolean;
};

const Comment: React.FC<CommentProps> = ({
  comment,
  compact = false,
  identifiable = false,
  outlined = false,
  loading,
  hideReplies = false,
}) => {
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
    () => deleteComment({ commentId: comment?.id as string }),
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
      className={clsx(
        `w-full flex flex-col`,
        compact ? "gap-2 p-4" : "gap-5 p-6",
        outlined
          ? "bg-white dark:bg-neutral-900 shadow-md border-2 border-zinc-300 dark:border-neutral-700"
          : "bg-slate-100 shadow-md dark:bg-zinc-800"
      )}
      id={identifiable ? comment?.id : undefined}
    >
      <div
        className={clsx(
          "flex w-full justify-between gap-10 sm:gap-0",
          compact && "text-sm"
        )}
      >
        <ShouldRender if={loading}>
          <Skeleton width="w-full max-w-[250px]" height="h-4" />
        </ShouldRender>
        <div className="flex gap-1 items-center">
          <span
            className={clsx(
              "font-medium flex items-center",
              compact && "text-base"
            )}
          >
            <Link
              href={`/users/${comment?.userId}`}
              title="Visit user profile"
              className="hover:underline text-ellipsis line-clamp-1"
            >
              {getUserDisplayName(comment?.user)}
            </Link>
            <ShouldRender if={comment?.userId === session?.user.id}>
              <span className="xl:text-base text-xs text-emerald-500 ml-1">
                {" "}
                (You)
              </span>
            </ShouldRender>
            <ShouldRender if={comment?.authorIsOP}>
              <span
                className="bg-emerald-500 dark:bg-emerald-600 ml-1 text-xs text-white font-bold p-[2px] px-1 shadow-sm select-none"
                title="Post author"
              >
                OP
              </span>
            </ShouldRender>
          </span>
        </div>

        <ShouldRender if={!compact}>
          <p
            className="cursor-pointer select-none xl:block hidden"
            onClick={toggleDateType}
          >
            {date}
          </p>
        </ShouldRender>
      </div>
      <ShouldRender if={!isEditing}>
        <HTMLBody
          className={clsx(
            compact ? "prose prose-sm" : "xl:prose prose prose-sm"
          )}
        >
          {comment?.body}
        </HTMLBody>
      </ShouldRender>

      <ShouldRender if={loading}>
        <Skeleton width="w-full" lines={3} />
      </ShouldRender>

      <ShouldRender if={isEditing}>
        <EditCommentForm onFinish={toggleIsEditing} comment={comment} />
      </ShouldRender>

      <div className="relative w-full flex justify-between items-center">
        <ShouldRender if={!isEditing}>
          <ShouldRender if={!compact}>
            <button
              onClick={toggleReplying}
              className="w-auto underline text-emerald-500"
            >
              {replying ? "Stop replying" : "Reply"}
            </button>
          </ShouldRender>

          <ShouldRender if={compact && !loading}>
            <div>
              <span>on</span>{" "}
              <Link
                className="w-auto underline text-emerald-500"
                href={`/posts/${comment?.postId}?highlightedComment=${comment?.id}`}
                as={`/posts/${comment?.postId}`}
              >
                {comment?.Post?.title}
              </Link>
            </div>
          </ShouldRender>
        </ShouldRender>

        <ShouldRender if={!compact && session?.user?.id === comment?.userId}>
          <div className="absolute -bottom-2 -right-2 flex gap-2 items-center">
            <ActionButton
              action={isEditing ? "close" : "edit"}
              onClick={toggleIsEditing}
            />

            <ActionButton action="delete" onClick={showDeleteConfirm} />
          </div>
        </ShouldRender>
      </div>

      {replying && <CommentField parentId={comment?.id} />}

      {comment?.children && comment?.children.length > 0 && !hideReplies && (
        <ListComments comments={comment?.children} />
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
