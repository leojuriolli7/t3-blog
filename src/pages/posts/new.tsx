import React, { useCallback } from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { CreatePostInput } from "src/schema/post.schema";
import MainLayout from "@components/MainLayout";
import withAuth from "@components/withAuth";
import MarkdownEditor from "@components/MarkdownEditor";

const CreatePostPage: React.FC = () => {
  const { register, handleSubmit, control } = useForm<CreatePostInput>();
  const router = useRouter();

  const {
    mutate: create,
    error,
    isLoading,
  } = trpc.useMutation(["posts.create-post"], {
    onSuccess: ({ id }) => {
      router.push(`/posts/${id}`);
    },
  });

  const onSubmit = useCallback(
    (values: CreatePostInput) => {
      create(values);
    },
    [create]
  );

  return (
    <MainLayout>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-3xl mx-auto flex flex-col items-center gap-10"
      >
        {error && error.message}

        <h1 className="text-2xl font-medium text-center">Create a post</h1>

        <input
          type="text"
          placeholder="your post title"
          className="bg-white border-zinc-300 border-[1px] dark:border-none p-3 w-full dark:bg-zinc-800"
          {...register("title")}
        />

        <MarkdownEditor
          placeholder="your post content - you can use markdown!"
          control={control}
          name="body"
        />

        <button
          className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
          type="submit"
          disabled={isLoading}
        >
          Create
        </button>
      </form>
    </MainLayout>
  );
};

export default withAuth(CreatePostPage);
