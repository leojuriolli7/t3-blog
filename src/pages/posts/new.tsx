import React, { useCallback } from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { CreatePostInput } from "src/schema/post.schema";

const CreatePostPage: React.FC = () => {
  const { register, handleSubmit } = useForm<CreatePostInput>();
  const router = useRouter();

  const { mutate: create, error } = trpc.useMutation(["posts.create-post"], {
    onSuccess: ({ id }) => {
      router.push(`/posts/${id}`);
    },
  });

  const onSubmit = useCallback(() => {
    (values: CreatePostInput) => {
      create(values);
    };
  }, [create]);

  return (
    <div className="mt-20 w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-5/12 max-w-xs mx-auto flex flex-col items-center gap-10"
      >
        {error && error.message}

        <h1 className="text-2xl font-medium text-center">Create a post</h1>

        <input
          type="text"
          placeholder="your post title"
          className="bg-slate-100 p-3 w-full"
          {...register("title")}
        />
        <br />
        <textarea
          className="bg-slate-100 p-3 w-full"
          placeholder="your post content"
          {...register("body")}
        />
        <br />

        <button
          className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
          type="submit"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;
