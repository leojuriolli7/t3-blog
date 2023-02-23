import { trpc } from "@utils/trpc";
import { CommentWithChildren } from "@utils/types";
import { useRouter } from "next/router";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { useCallback, useEffect, useState } from "react";
import { useUserContext } from "src/context/user.context";
import useGetDate from "src/hooks/useGetDate";
import CommentField from "./CommentField";
import ListComments from "./Comments";
import ReactMarkdown from "./ReactMarkdown";
import ShouldRender from "./ShouldRender";
import { MdClose } from "react-icons/md";
import { useForm } from "react-hook-form";
import { UpdateCommentInput } from "src/schema/comment.schema";
import { toast } from "react-hot-toast";

type CommentProps = {
  comment: CommentWithChildren;
};

type Dates = "distance" | "date";

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [replying, setReplying] = useState(false);
  const user = useUserContext();
  const utils = trpc.useContext();

  const router = useRouter();
  const postId = router.query.postId as string;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleIsEditing = useCallback(() => setIsEditing((prev) => !prev), []);

  const { register, handleSubmit, watch } = useForm<UpdateCommentInput>({
    defaultValues: {
      body: comment?.body,
    },
  });

  const {
    mutate: update,
    isLoading: updating,
    error: updateError,
  } = trpc.useMutation(["comments.update-comment"], {
    onSuccess: () => {
      utils.invalidateQueries([
        "comments.all-comments",
        {
          postId,
        },
      ]);
    },
  });

  const watchBody = watch("body");
  const shouldBlockUserFromUpdating = !watchBody || watchBody === comment?.body;

  const onSubmit = useCallback(
    (values: UpdateCommentInput) => {
      update({
        commentId: comment.id,
        body: values.body,
      });

      setIsEditing(false);
    },
    [update, comment]
  );

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

    if (updateError) {
      toast.error(updateError?.message);
    }
  }, [updateError, deleteError]);

  return (
    <div className="w-full flex flex-col gap-5 bg-slate-100 shadow-md p-6 dark:bg-zinc-800">
      <div className="flex w-full justify-between">
        <h3 className="font-medium">{comment.user.name}</h3>

        <p className="cursor-pointer" onClick={toggleDateType}>
          {date}
        </p>
      </div>
      <ShouldRender if={!isEditing}>
        <ReactMarkdown className="prose-sm">{comment.body}</ReactMarkdown>
      </ShouldRender>

      <ShouldRender if={isEditing}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <textarea
            className="bg-slate-100 p-3 w-full mt-2 shadow-md dark:bg-zinc-900 h-40"
            {...register("body")}
            placeholder="type your comment"
          />

          <ShouldRender if={isEditing}>
            <button
              className="bg-emerald-500 text-white min-w-fit px-8 py-2 mt-2"
              type="submit"
              disabled={updating || shouldBlockUserFromUpdating}
            >
              Update
            </button>
          </ShouldRender>
        </form>
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
            <button
              onClick={toggleIsEditing}
              className="bg-teal-100 dark:bg-teal-900 p-2 shadow-lg hover:opacity-70"
            >
              <ShouldRender if={!isEditing}>
                <AiFillEdit className=" text-emerald-500" size={23} />
              </ShouldRender>

              <ShouldRender if={isEditing}>
                <MdClose className=" text-emerald-500" size={23} />
              </ShouldRender>
            </button>
            <button
              onClick={onClickDeleteComment}
              disabled={deleting}
              className="bg-teal-100 dark:bg-teal-900 p-2 shadow-lg hover:opacity-70"
            >
              <AiFillDelete className=" text-emerald-500" size={23} />
            </button>
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
