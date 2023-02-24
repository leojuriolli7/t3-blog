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
          className="bg-slate-100 p-3 w-full dark:bg-zinc-800"
          {...register("title")}
        />

        <MarkdownEditor control={control} name="body" />
        <br />

        <button
          className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
          type="submit"
          disabled={isLoading}
        >
          Create
        </button>

        <div>
          <p className="prose dark:prose-invert">
            PS: You can use{" "}
            <a
              className="text-emerald-500"
              href="https://www.markdownguide.org/basic-syntax/"
              target="_blank"
              rel="noreferrer"
            >
              markdown!
            </a>
          </p>
        </div>
      </form>
    </MainLayout>
  );
};

export default withAuth(CreatePostPage);
