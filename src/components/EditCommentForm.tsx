import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UpdateCommentInput } from "src/schema/comment.schema";
import { CommentWithChildren } from "@utils/types";
import { trpc } from "@utils/trpc";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import MarkdownEditor from "./MarkdownEditor";

type Props = {
  comment: CommentWithChildren;
  onFinish: () => void;
};

const EditCommentForm: React.FC<Props> = ({ comment, onFinish }) => {
  const utils = trpc.useContext();

  const router = useRouter();
  const postId = router.query.postId as string;

  const { register, handleSubmit, watch, control } =
    useForm<UpdateCommentInput>({
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

      onFinish();
    },
    [update, comment, onFinish]
  );

  useEffect(() => {
    if (updateError) {
      toast.error(updateError?.message);
    }
  }, [updateError]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MarkdownEditor
        control={control}
        variant="condensed"
        name="body"
        placeholder="type your comment"
      />

      <button
        className="bg-emerald-500 text-white min-w-fit px-8 py-2 mt-2"
        type="submit"
        disabled={updating || shouldBlockUserFromUpdating}
      >
        Update
      </button>
    </form>
  );
};

export default EditCommentForm;
