import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CreateCommentInput,
  createCommentSchema,
} from "@schema/comment.schema";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import ShouldRender from "./ShouldRender";
import MarkdownEditor from "./MarkdownEditor";
import Field from "./Field";
import { useSession } from "next-auth/react";
import Button from "./Button";

type Props = {
  parentId?: string;
  onCommented?: () => void;
};

const CommentField: React.FC<Props> = ({ parentId, onCommented }) => {
  const router = useRouter();
  const postId = router.query.postId as string;

  const uploadingImagesState = useState(false);
  const [uploading] = uploadingImagesState;

  const { handleSubmit, setValue, control, formState } =
    useForm<CreateCommentInput>({
      resolver: zodResolver(createCommentSchema),
      shouldFocusError: false,
      reValidateMode: "onSubmit",
      defaultValues: {
        body: undefined,
        postId,
      },
    });

  const { errors } = formState;

  const { status: sessionStatus } = useSession();
  const utils = trpc.useContext();

  const isReply = parentId;

  const {
    mutate,
    isLoading,
    error: createCommentError,
  } = trpc.comments.addComment.useMutation({
    onSuccess: () => {
      // Reset markdown editor content.
      setValue("body", "");

      if (onCommented) onCommented();

      // This will refetch the comments.
      utils.comments.allComments.invalidate({
        postId,
      });
    },
  });

  const onSubmit = useCallback(
    (values: CreateCommentInput) => {
      if (sessionStatus !== "authenticated") {
        return toast.info("Please login to comment");
      }

      if (sessionStatus === "authenticated") {
        const payload = {
          ...values,
          postId,
          parentId,
        };

        mutate(payload);
      }
    },
    [mutate, parentId, postId, sessionStatus]
  );

  useEffect(() => {
    if (createCommentError) toast.error(createCommentError?.message);
  }, [createCommentError]);

  useEffect(() => {
    if (postId) setValue("postId", postId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return (
    <form className="mt-1" onSubmit={handleSubmit(onSubmit)}>
      <Field error={errors.body}>
        <MarkdownEditor
          uploadingState={uploadingImagesState}
          variant="condensed"
          name="body"
          control={control}
          defaultValue={undefined}
          placeholder={isReply ? "Post reply" : "Post comment"}
        />
      </Field>
      <div className="w-full sm:flex sm:justify-between">
        <Button
          className="mt-2 flex w-full justify-center rounded-md sm:w-auto"
          type="submit"
          loading={isLoading || uploading}
        >
          {isReply ? "Send reply" : "Send comment"}
        </Button>

        <ShouldRender if={!isReply}>
          <p className="prose mt-1 hidden text-right text-sm dark:prose-invert sm:block">
            powered by{" "}
            <a
              className="text-emerald-500"
              href="https://www.markdownguide.org/basic-syntax/"
              target="_blank"
              rel="noreferrer"
            >
              markdown
            </a>
          </p>
        </ShouldRender>
      </div>
    </form>
  );
};

export default CommentField;
