import React, { useCallback, useEffect } from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreatePostInput, createPostSchema } from "src/schema/post.schema";
import MainLayout from "@components/MainLayout";
import MarkdownEditor from "@components/MarkdownEditor";
import { toast } from "react-toastify";
import Field from "@components/Field";
import { isObjectEmpty } from "@utils/checkEmpty";
import MetaTags from "@components/MetaTags";
import SelectTags from "@components/SelectTags";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";

const CreatePostPage: React.FC = () => {
  const { register, handleSubmit, control, formState } =
    useForm<CreatePostInput>({
      resolver: zodResolver(createPostSchema),
      shouldFocusError: false,
    });
  const router = useRouter();

  const { errors } = formState;

  const { data: tags, isLoading: fetchingTags } = trpc.useQuery(
    ["posts.tags"],
    {
      refetchOnWindowFocus: false,
    }
  );
  const initialTags = tags?.map((tag) => tag.name);

  const {
    mutate: create,
    error: createError,
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

  useEffect(() => {
    if (createError) toast.error(createError?.message);
  }, [createError]);

  return (
    <>
      <MetaTags title="New post" />
      <MainLayout>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-3xl mx-auto flex flex-col gap-10"
        >
          <h1 className="text-2xl font-medium text-center">Create a post</h1>

          <Field error={errors.title}>
            <input
              type="text"
              placeholder="your post title"
              className="bg-white border-zinc-300 border-[1px] dark:border-neutral-800 p-3 w-full dark:bg-neutral-900"
              {...register("title")}
            />
          </Field>

          <Field error={errors.body}>
            <MarkdownEditor
              placeholder="your post content - you can use markdown!"
              control={control}
              name="body"
            />
          </Field>

          <SelectTags
            control={control}
            initialTags={initialTags}
            name="tags"
            error={errors.tags}
          />

          <button
            className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2 mx-auto"
            type="submit"
            disabled={isLoading || fetchingTags || !isObjectEmpty(errors)}
          >
            Create
          </button>
        </form>
      </MainLayout>
    </>
  );
};

export default CreatePostPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is not logged in, redirect.
  if (!session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {},
  };
}
