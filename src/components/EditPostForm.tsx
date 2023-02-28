import { useForm, FormProvider } from "react-hook-form";
import { createPostSchema, UpdatePostInput } from "src/schema/post.schema";
import { v4 as uuid } from "uuid";
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
  const { data: tags, isLoading: fetchingTags } = trpc.useQuery(["posts.tags"]);

  const allTags = tags?.map((tag) => tag.name);
  const currentTags = post?.tags?.map((tag) => tag.name);

  const methods = useForm<UpdatePostInput>({
    resolver: zodResolver(createPostSchema),
    shouldFocusError: false,
    defaultValues: {
      body: post?.body,
      title: post?.title,
    },
  });

  const { errors } = methods.formState;

  const {
    mutate: update,
    isLoading: updating,
    error: updateError,
  } = trpc.useMutation(["posts.update-post"], {
    onMutate: async ({ postId, tags, body, title }) => {
      await utils.cancelQuery(["posts.single-post", { postId }]);

      const prevData = utils.getQueryData(["posts.single-post", { postId }]);

      const mappedTags = tags.map((tag) => ({
        name: tag,
        id: uuid(),
      }));

      utils.setQueryData(["posts.single-post", { postId }], (old) => ({
        ...old!,
        ...(body && {
          body,
        }),
        ...(title && {
          title,
        }),
        tags: mappedTags,
      }));

      return { prevData };
    },
    onError: (err, newData, context) => {
      utils.setQueryData(["posts.single-post"], context?.prevData as Post);
    },
    onSettled: () => {
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
      methods.setValue("body", post?.body);
      methods.setValue("title", post?.title);
    }
  }, [post, methods]);

  useEffect(() => {
    if (updateError) toast.error(updateError?.message);
  }, [updateError]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-full mx-auto flex flex-col items-center gap-10"
      >
        <Field error={errors.title}>
          <input
            type="text"
            placeholder="your post title"
            className="bg-white border-zinc-300 border-[1px] dark:border-none p-3 w-full dark:bg-neutral-900"
            {...methods.register("title")}
          />
        </Field>

        <Field error={errors.body}>
          <MarkdownEditor control={methods.control} name="body" />
        </Field>

        <div className="w-full">
          <SelectTags
            name="tags"
            control={methods.control}
            error={errors.tags}
            initialTags={allTags}
            initialSelectedTags={currentTags}
          />
        </div>

        <button
          className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
          type="submit"
          disabled={updating || shouldBlockUserFromUpdating || fetchingTags}
        >
          Update
        </button>
      </form>
    </FormProvider>
  );
};

export default EditPostForm;
