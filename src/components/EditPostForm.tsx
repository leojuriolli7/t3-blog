import { useForm } from "react-hook-form";
import { createPostSchema, UpdatePostInput } from "src/schema/post.schema";
import { trpc } from "@utils/trpc";
import React, { useCallback, useEffect } from "react";
import { Post } from "@utils/types";
import { useRouter } from "next/router";
import MarkdownEditor from "./MarkdownEditor";
import Field from "./Field";
import { zodResolver } from "@hookform/resolvers/zod";
import { isObjectEmpty } from "@utils/checkEmpty";
import { toast } from "react-toastify";
import SelectTags from "./SelectTags";

type Props = {
  post?: Post;
  onFinish: () => void;
};

const EditPostForm: React.FC<Props> = ({ post, onFinish }) => {
  const utils = trpc.useContext();
  const router = useRouter();
  const postId = router.query.postId as string;
  const { data: tags } = trpc.useQuery(["posts.tags"]);

  const allTags = tags?.map((tag) => tag.name);
  const currentTags = post?.tags?.map((tag) => tag.name);

  const { register, handleSubmit, setValue, control, formState } =
    useForm<UpdatePostInput>({
      resolver: zodResolver(createPostSchema),
      shouldFocusError: false,
      defaultValues: {
        body: post?.body,
        title: post?.title,
      },
    });

  const { errors } = formState;

  const {
    mutate: update,
    isLoading: updating,
    error: updateError,
  } = trpc.useMutation(["posts.update-post"], {
    onSuccess: () => {
      utils.invalidateQueries([
        "posts.single-post",
        {
          postId,
        },
      ]);
    },
  });

  const shouldBlockUserFromUpdating = !isObjectEmpty(errors);

  const onSubmit = useCallback(
    (values: UpdatePostInput) => {
      update({
        ...values,
        postId,
      });

      onFinish();
    },
    [update, postId, onFinish]
  );

  useEffect(() => {
    if (post) {
      setValue("body", post?.body);
      setValue("title", post?.title);
    }
  }, [post, setValue]);

  useEffect(() => {
    if (updateError) toast.error(updateError?.message);
  }, [updateError]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mx-auto flex flex-col items-center gap-10"
    >
      <Field error={errors.title}>
        <input
          type="text"
          placeholder="your post title"
          className="bg-white border-zinc-300 border-[1px] dark:border-none p-3 w-full dark:bg-neutral-900"
          {...register("title")}
        />
      </Field>

      <Field error={errors.body}>
        <MarkdownEditor control={control} name="body" />
      </Field>

      <div className="w-full">
        <SelectTags
          name="tags"
          control={control}
          error={errors.tags}
          initialTags={allTags}
          initialSelectedTags={currentTags}
        />
      </div>

      <button
        className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
        type="submit"
        disabled={updating || shouldBlockUserFromUpdating}
      >
        Update
      </button>
    </form>
  );
};

export default EditPostForm;
