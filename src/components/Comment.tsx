import { trpc } from "@utils/trpc";
import { CommentWithChildren } from "@utils/types";
import { useRouter } from "next/router";
import { AiFillDelete } from "react-icons/ai";
import { useCallback, useState } from "react";
import { useUserContext } from "src/context/user.context";
import useGetDate from "src/hooks/useGetDate";
import CommentField from "./CommentField";
import ListComments from "./Comments";
import ReactMarkdown from "./ReactMarkdown";
import ShouldRender from "./ShouldRender";

type CommentProps = {
  comment: CommentWithChildren;
};

type Dates = "distance" | "date";

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [replying, setReplying] = useState(false);
  const user = useUserContext();
  const utils = trpc.useContext();

  const { date, toggleDateType } = useGetDate(comment?.createdAt);

  const router = useRouter();
  const postId = router.query.postId as string;

  const { mutate: deleteComment, isLoading: deleting } = trpc.useMutation(
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

  const toggleReplying = useCallback(
    () => setReplying((previousState) => !previousState),
    []
  );

  return (
    <div className="w-full flex flex-col gap-5 bg-slate-100 shadow-md p-6 dark:bg-zinc-800">
      <div className="flex w-full justify-between">
        <h3 className="font-medium">{comment.user.name}</h3>

        <p className="cursor-pointer" onClick={toggleDateType}>
          {date}
        </p>
      </div>
      <ReactMarkdown className="prose-sm">{comment.body}</ReactMarkdown>

      <div className="relative w-full flex justify-between">
        <button
          onClick={toggleReplying}
          className="w-auto underline text-emerald-500"
        >
          {replying ? "Stop replying" : "Reply"}
        </button>

        <ShouldRender if={user?.id === comment.userId}>
          <button
            onClick={onClickDeleteComment}
            disabled={deleting}
            className="absolute -bottom-2 -right-2 bg-teal-100 dark:bg-teal-900 p-2 shadow-lg hover:opacity-70"
          >
            <AiFillDelete className=" text-emerald-500" size={23} />
          </button>
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
