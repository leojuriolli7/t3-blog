import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  UpdateCommentInput,
  updateCommentSchema,
} from "@schema/comment.schema";
import { CommentWithChildren } from "@utils/types";
import { trpc } from "@utils/trpc";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import MarkdownEditor from "./MarkdownEditor";
import Field from "./Field";
import Button from "./Button";

type Props = {
  comment?: CommentWithChildren;
  onFinish: () => void;
};

const EditCommentForm: React.FC<Props> = ({ comment, onFinish }) => {
  const utils = trpc.useContext();

  const router = useRouter();
  const postId = router.query.postId as string;

  const { handleSubmit, control, formState } = useForm<UpdateCommentInput>({
    resolver: zodResolver(updateCommentSchema),
    shouldFocusError: false,
    defaultValues: {
      body: comment?.markdownBody,
      commentId: comment?.id,
    },
  });

  const { errors } = formState;

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

  const onSubmit = useCallback(
    (values: UpdateCommentInput) => {
      update({
        commentId: comment?.id as string,
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
      <Field error={errors.body}>
        <MarkdownEditor
          control={control}
          variant="condensed"
          name="body"
          placeholder="type your comment"
        />
      </Field>

      <Button
        className="mt-2 px-6 sm:w-auto"
        variant="secondary"
        type="submit"
        loading={updating}
      >
        Update
      </Button>
    </form>
  );
};

export default EditCommentForm;
