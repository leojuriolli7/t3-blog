import React from "react";
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

  const onSubmit = (values: CreatePostInput) => {
    create(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && error.message}

      <h1>Create a post</h1>

      <input type="text" placeholder="your post title" {...register("title")} />
      <br />
      <textarea placeholder="your post content" {...register("body")} />
      <br />

      <button type="submit">Create</button>
    </form>
  );
};

export default CreatePostPage;
