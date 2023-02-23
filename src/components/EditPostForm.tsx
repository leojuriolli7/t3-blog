import { useForm } from "react-hook-form";
import { UpdatePostInput } from "src/schema/post.schema";
import { trpc } from "@utils/trpc";
import React, { useCallback, useEffect } from "react";
import { Post } from "@utils/types";
import { useRouter } from "next/router";

type Props = {
  post?: Post;
  onFinish: () => void;
};

const EditPostForm: React.FC<Props> = ({ post, onFinish }) => {
  const utils = trpc.useContext();

  const router = useRouter();
  const postId = router.query.postId as string;

  const { register, handleSubmit, watch, setValue } = useForm<UpdatePostInput>({
    defaultValues: {
      body: post?.body,
      title: post?.title,
    },
  });

  const { mutate: update, isLoading: updating } = trpc.useMutation(
    ["posts.update-post"],
    {
      onSuccess: () => {
        utils.invalidateQueries([
          "posts.single-post",
          {
            postId,
          },
        ]);
      },
    }
  );

  const watchBody = watch("body");
  const watchTitle = watch("title");

  const shouldBlockUserFromUpdating =
    !watchBody ||
    !watchTitle ||
    (watchTitle === post?.title && watchBody === post?.body);

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mx-auto flex flex-col items-center gap-10"
    >
      <input
        type="text"
        placeholder="your post title"
        className="bg-gray-300 p-3 w-full dark:bg-neutral-900"
        {...register("title")}
      />

      <textarea
        className="bg-gray-300 p-3 w-full h-44 dark:bg-neutral-900"
        placeholder="your post content"
        {...register("body")}
      />

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
