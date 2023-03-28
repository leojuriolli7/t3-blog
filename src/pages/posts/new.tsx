import React, { useCallback, useEffect } from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { CreatePostInput, createPostSchema } from "@schema/post.schema";
import MainLayout from "@components/MainLayout";
import MarkdownEditor from "@components/MarkdownEditor";
import { toast } from "react-toastify";
import Field from "@components/Field";
import MetaTags from "@components/MetaTags";
import SelectTags from "@components/SelectTags";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import Dropzone from "@components/Dropzone";
import Link from "@components/Link";
import CreatePoll from "@components/CreatePoll";
import Button from "@components/Button";
import TextInput from "@components/TextInput";

const CreatePostPage: React.FC = () => {
  const router = useRouter();

  const methods = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    shouldFocusError: false,
  });

  const { register, handleSubmit, control, formState, watch } = methods;

  const files = watch("files");
  const { errors } = formState;

  const { data: tags, isLoading: fetchingTags } = trpc.useQuery(
    ["posts.tags"],
    {
      refetchOnWindowFocus: false,
      ssr: false,
    }
  );
  const initialTags = tags?.map((tag) => tag.name);

  const { mutateAsync: createPresignedUrl } = trpc.useMutation(
    "attachments.create-presigned-url"
  );

  const uploadAttachment = async (postId: string, file: File) => {
    const name = file?.name || "Uploaded attachment";
    const type = file?.type || "unknown";

    const { url, fields } = await createPresignedUrl({ postId, name, type });
    const formData = new FormData();

    Object.keys(fields).forEach((key) => {
      formData.append(key, fields[key]);
    });

    formData.append("Content-Type", file.type);
    formData.append("file", file);

    await fetch(url, {
      method: "POST",
      body: formData,
    });
  };

  const {
    mutate: create,
    error: createError,
    isLoading,
  } = trpc.useMutation(["posts.create-post"], {
    onSuccess: async ({ id }) => {
      if (files) {
        const filesArray = Array.from(files);

        // Wait for uploads to finish before redirecting.
        await Promise.all(
          filesArray.map(async (file) => {
            await uploadAttachment(id, file);
          })
        );
      }

      router.push(`/posts/${id}`);
    },
  });

  const onSubmit = useCallback(
    (values: CreatePostInput) => {
      create({
        body: values.body,
        tags: values.tags,
        title: values.title,
        ...(values?.link && {
          link: values?.link,
        }),
        ...(values?.poll?.title &&
          values?.poll?.options && {
            poll: values?.poll,
          }),
      });
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
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-3xl mx-auto flex flex-col gap-10"
          >
            <h1 className="text-2xl font-medium text-center">Create a post</h1>

            <Field error={errors.title}>
              <TextInput
                variant="primary"
                sizeVariant="lg"
                type="text"
                placeholder="your post title"
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

            <Link />

            <CreatePoll />

            <Dropzone />

            <SelectTags
              control={control}
              initialTags={initialTags}
              name="tags"
              error={errors.tags}
            />

            <Button
              className="sm:w-6/12 w-full min-w-fit mx-auto flex justify-center"
              variant="primary"
              type="submit"
              loading={isLoading}
              disabled={fetchingTags}
            >
              Create
            </Button>
          </form>
        </FormProvider>
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
