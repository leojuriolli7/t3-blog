import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  CreateCommentInput,
  createCommentSchema,
} from "src/schema/comment.schema";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { useUserContext } from "src/context/user.context";
import { isObjectEmpty } from "@utils/checkEmpty";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import ShouldRender from "./ShouldRender";
import MarkdownEditor from "./MarkdownEditor";
import Field from "./Field";

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

  const user = useUserContext();
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
      if (!user) {
        return toast.info("Please login to comment");
      }

      if (user) {
        const payload = {
          ...values,
          postId,
          parentId,
        };

        mutate(payload);
      }
    },
    [mutate, parentId, postId, user]
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
            className="px-5 py-2 mt-2 bg-emerald-500 text-white"
            type="submit"
            disabled={isLoading || !isObjectEmpty(errors)}
          >
            Send comment
          </button>

          <ShouldRender if={!isReply}>
            <p className="prose dark:prose-invert">
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
