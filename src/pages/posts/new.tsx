import React, { useCallback } from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { CreatePostInput } from "src/schema/post.schema";

const CreatePostPage: React.FC = () => {
  const { register, handleSubmit } = useForm<CreatePostInput>();
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
    <div className="mt-20 w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-5/12 max-w-sm mx-auto flex flex-col items-center gap-10"
      >
        {error && error.message}

        <h1 className="text-2xl font-medium text-center">Create a post</h1>

        <input
          type="text"
          placeholder="your post title"
          className="bg-slate-100 p-3 w-full"
          {...register("title")}
        />

        <textarea
          className="bg-slate-100 p-3 w-full h-44"
          placeholder="your post content"
          {...register("body")}
        />
        <br />

        <button
          className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
          type="submit"
          disabled={isLoading}
        >
          Create
        </button>

        <div>
          <p className="prose">
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
    </div>
  );
};

export default CreatePostPage;
