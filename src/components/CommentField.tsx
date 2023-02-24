import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { CreateCommentInput } from "src/schema/comment.schema";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { useUserContext } from "src/context/user.context";
import { toast } from "react-toastify";
import ShouldRender from "./ShouldRender";
import MarkdownEditor from "./MarkdownEditor";

type Props = {
  parentId?: string;
};

const CommentField: React.FC<Props> = ({ parentId }) => {
  const { handleSubmit, setValue, watch, control } =
    useForm<CreateCommentInput>({
      defaultValues: {
        body: undefined,
      },
    });

  const user = useUserContext();
  const bodyValue = watch("body");

  const router = useRouter();
  const postId = router.query.postId as string;
  const utils = trpc.useContext();

  const isReply = parentId;

  const { mutate, isLoading, error } = trpc.useMutation(
    ["comments.add-comment"],
    {
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
    }
  );

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

  return (
    <div className={isReply ? `` : "mt-6"}>
      <ShouldRender if={!isReply}>
        <h2 className="text-lg font-medium">Comments</h2>
      </ShouldRender>

      {error && error.message}

      <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
        <MarkdownEditor
          variant="condensed"
          name="body"
          control={control}
          defaultValue={undefined}
          placeholder={isReply ? "Post reply" : "Post comment"}
        />
        <div className="sm:flex w-full sm:justify-between">
          <button
            className="px-5 py-2 mt-2 bg-emerald-500 text-white"
            type="submit"
            disabled={isLoading || !bodyValue}
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
