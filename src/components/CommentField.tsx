import React, { useCallback, useEffect } from "react";
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

type Props = {
  parentId?: string;
};

const CommentField: React.FC<Props> = ({ parentId }) => {
  const router = useRouter();
  const postId = router.query.postId as string;

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
  } = trpc.useMutation(["comments.add-comment"], {
    onSuccess: () => {
      // Reset markdown editor content.
      setValue("body", "");

      // This will refetch the comments.
      utils.invalidateQueries([
        "comments.all-comments",
        {
          postId,
        },
      ]);
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

  return (
    <div className={isReply ? `` : "mt-6"}>
      <ShouldRender if={!isReply}>
        <h2 className="text-lg font-medium">Comments</h2>
      </ShouldRender>

      <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
        <Field error={errors.body}>
          <MarkdownEditor
            variant="condensed"
            name="body"
            control={control}
            defaultValue={undefined}
            placeholder={isReply ? "Post reply" : "Post comment"}
          />
        </Field>
        <div className="sm:flex w-full sm:justify-between">
          <button
            className={`px-5 py-2 mt-2 bg-emerald-500 dark:bg-teal-900 text-white sm:w-auto hover:opacity-80 ${
              !isReply ? "w-full" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            Send comment
          </button>

          <ShouldRender if={!isReply}>
            <p className="prose dark:prose-invert sm:text-base text-sm text-right mt-1 sm:mt-0">
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
    </div>
  );
};

export default CommentField;
