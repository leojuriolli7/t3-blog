import { trpc } from "@utils/trpc";
import type { CommentWithChildren } from "@utils/types";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import Link from "next/link";
import useMediaQuery from "@hooks/useMediaQuery";
import dynamic from "next/dynamic";
import getUserDisplayName from "@utils/getUserDisplayName";
import ListComments from "./Comments";
import ShouldRender from "./ShouldRender";
import ActionButton from "./ActionButton";
import HTMLBody from "./HTMLBody";
import Skeleton from "./Skeleton";
import { Badge } from "./Badge";

const ConfirmationModal = dynamic(
  () => import("@components/ConfirmationModal"),
  {
    ssr: false,
  }
);

const EditCommentForm = dynamic(() => import("@components/EditCommentForm"), {
  ssr: false,
  loading: () => (
    <Skeleton parentClass="h-[200px] mt-2" width="w-full" heading lines={5} />
  ),
});

const CommentField = dynamic(() => import("@components/CommentField"), {
  ssr: false,
  loading: () => (
    <Skeleton parentClass="h-[200px] mt-2" width="w-full" heading lines={5} />
  ),
});

const CommentActionModal = dynamic(
  () => import("@components/CommentActionModal"),
  {
    ssr: false,
  }
);

type Variant = "outlined" | "primary";

const VARIANT_CLASSES = {
  outlined:
    "bg-white dark:border-zinc-700/90 dark:bg-zinc-800 shadow-md border-2 border-zinc-300",
  primary: "bg-slate-100 dark:bg-zinc-800",
};

type CommentProps = {
  comment?: CommentWithChildren;
  /**
   * Make the comment component dimensions smaller.
   */
  compact?: boolean;
  /**
   * Turn comment footer into link to the post.
   */
  linkToPost?: boolean;
  /**
   * Comment id will be the <div>'s id.
   */
  identifiable?: boolean;
  /**
   * Hides comment replies.
   */
  hideReplies?: boolean;
  hideActions?: boolean;
  loading?: boolean;
  variant?: Variant;
};

const getCommentClasses = (
  hasParent: boolean,
  hasChildren: boolean,
  compact: boolean
) => {
  const commentWithParentClasses =
    hasParent && "border-r-0 border-b-0 rounded-tr-none";

  const childrenlessCommentClasses =
    !hasChildren && (compact ? "pb-4" : "pb-6");

  return clsx(commentWithParentClasses, childrenlessCommentClasses);
};

const Comment: React.FC<CommentProps> = ({
  comment,
  compact = false,
  identifiable = false,
  variant = "primary",
  loading,
  hideReplies = false,
  hideActions = false,
  linkToPost = false,
}) => {
  const replyState = useState(false);
  const [replying, setReplying] = replyState;

  const [collapsed, setCollapsed] = useState(false);
  const shouldRenderModals = useMediaQuery("(max-width: 768px)");

  const toggleCollapsed = () => setCollapsed((prev) => !prev);
  const canCollapseComment = !!comment?.children?.length && !hideReplies;

  const onCommented = () => {
    if (collapsed) setCollapsed(false);
  };

  const { data: session, status: sessionStatus } = useSession();
  const utils = trpc.useContext();

  const canDeleteOrEdit =
    session?.user?.id === comment?.userId || session?.user?.isAdmin === true;

  const commentClasses = getCommentClasses(
    !!comment?.parentId,
    !!comment?.children?.length,
    compact
  );
  const router = useRouter();
  const postId = router.query.postId as string;

  const isDeleteModalOpen = useState(false);
  const [, setIsDeleteModalOpen] = isDeleteModalOpen;

  const showDeleteConfirm = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

  const editingState = useState<boolean>(false);
  const [isEditing, setIsEditing] = editingState;
  const toggleIsEditing = useCallback(
    () => setIsEditing((prev) => !prev),
    [setIsEditing]
  );

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
    [setReplying]
  );

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError?.message);
    }
  }, [deleteError]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") setIsEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  return (
    <div
      className={clsx(
        VARIANT_CLASSES[variant],
        `relative flex w-full flex-col rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-700/90`,
        compact ? "gap-2 pl-2 sm:pl-4" : "gap-5 pl-3 sm:pl-6",
        !hideReplies && commentClasses
      )}
      id={identifiable ? comment?.id : undefined}
    >
      <ShouldRender if={canCollapseComment}>
        <button
          type="button"
          aria-label={
            collapsed ? "Uncollapse comments" : "Collapse all child comments"
          }
          onClick={toggleCollapsed}
          className={clsx(
            "absolute left-0 top-0 h-full rounded-l-lg bg-inherit hover:brightness-[98%] dark:hover:brightness-125",
            compact ? "w-2 gap-2 sm:w-4" : "w-3 gap-5 sm:w-6"
          )}
        />

        {collapsed && (
          <HiOutlineDotsVertical
            aria-label="Comments are collapsed"
            title="Comments are collapsed"
            className="absolute -left-1 bottom-2 h-5 w-5 text-neutral-400 dark:text-neutral-500/60 sm:left-0 sm:h-[25px] sm:w-[25px]"
          />
        )}
      </ShouldRender>
      <div
        className={clsx(
          "relative flex w-full flex-col gap-2 pl-2",
          compact ? "p-4" : "p-6",
          !hideReplies && !collapsed && "pb-0",
          hideReplies && (compact ? "pb-4" : "pb-6")
        )}
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
          <div className="flex items-center gap-1">
            <span
              className={clsx(
                "flex items-center font-medium",
                compact && "text-base"
              )}
            >
              <Link
                href={`/users/${comment?.userId}`}
                title="Visit user profile"
                className="line-clamp-1 text-ellipsis hover:underline"
              >
                {getUserDisplayName(comment?.user)}
              </Link>
              <ShouldRender
                if={comment?.userId === session?.user.id && !!session?.user.id}
              >
                <span className="ml-1 text-xs text-emerald-500 xl:text-base">
                  {" "}
                  (You)
                </span>
              </ShouldRender>
              <ShouldRender if={comment?.authorIsOP}>
                <Badge title="Post author">OP</Badge>
              </ShouldRender>
            </span>
          </div>

          <ShouldRender if={!compact}>
            <p className="block text-sm xl:text-base">{comment?.createdAt}</p>
          </ShouldRender>
        </div>
        <ShouldRender if={!isEditing || shouldRenderModals}>
          <HTMLBody
            className={clsx(compact ? "prose prose-sm" : "prose -xl:prose-sm")}
          >
            {comment?.body}
          </HTMLBody>
        </ShouldRender>

        <ShouldRender if={loading}>
          <Skeleton width="w-full" lines={3} />
        </ShouldRender>

        <ShouldRender if={isEditing && !shouldRenderModals}>
          <EditCommentForm onFinish={toggleIsEditing} comment={comment} />
        </ShouldRender>

        <div className="relative flex w-full items-center justify-between">
          <ShouldRender if={!isEditing || shouldRenderModals}>
            <ShouldRender if={!linkToPost && !loading && !hideActions}>
              <button
                onClick={toggleReplying}
                className="w-auto text-sm text-emerald-500 underline xl:text-base"
              >
                {replying ? "Stop replying" : "Reply"}
              </button>
            </ShouldRender>

            <ShouldRender if={linkToPost && !loading}>
              <p
                className={clsx(
                  "line-clamp-2 w-full text-ellipsis border-t border-zinc-300 pt-4 font-bold dark:border-zinc-700",
                  compact ? "text-xs sm:text-sm" : "text-sm xl:text-base"
                )}
              >
                <span>commented on</span>{" "}
                <Link
                  className="w-auto text-emerald-500 underline"
                  href={`/posts/${comment?.postId}?highlightedComment=${comment?.id}`}
                  as={`/posts/${comment?.postId}`}
                >
                  {comment?.Post?.title}
                </Link>
              </p>
            </ShouldRender>
          </ShouldRender>

          <ShouldRender if={!linkToPost && canDeleteOrEdit && !hideActions}>
            <div className="absolute -bottom-3 -right-2 flex items-center gap-2">
              <ActionButton
                action={isEditing ? "close" : "edit"}
                onClick={toggleIsEditing}
              />

              <ActionButton action="delete" onClick={showDeleteConfirm} />
            </div>
          </ShouldRender>
        </div>

        {replying && !shouldRenderModals && (
          <CommentField parentId={comment?.id} onCommented={onCommented} />
        )}
      </div>

      {comment?.children && comment?.children.length > 0 && !hideReplies && (
        <ListComments comments={comment?.children} collapsed={collapsed} />
      )}

      <ConfirmationModal
        title="Are you sure you want to delete this comment?"
        confirmationLabel="Delete comment"
        openState={isDeleteModalOpen}
        loading={deleting}
        onConfirm={onClickDeleteComment}
      />

      <ShouldRender if={shouldRenderModals}>
        <CommentActionModal parentComment={comment} openState={replyState} />
        <CommentActionModal
          parentComment={comment}
          openState={editingState}
          editing
        />
      </ShouldRender>
    </div>
  );
};

export default Comment;
