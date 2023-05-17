import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { CreatePostInput, createPostSchema } from "@schema/post.schema";
import MarkdownEditor from "@components/MarkdownEditor";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import Field from "@components/Field";
import MetaTags from "@components/MetaTags";
import SelectTags from "@components/SelectTags";
import type { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import Dropzone from "@components/Dropzone";
import LinkInput from "@components/LinkInput";
import CreatePoll from "@components/CreatePoll";
import Button from "@components/Button";
import TextInput from "@components/TextInput";
import { uploadFileToS3 } from "@utils/aws/uploadFileToS3";
import { useUploadTagImagesToS3 } from "@hooks/aws/useUploadTagImagesToS3";
import { parseTagPayload } from "@utils/parseTagPayload";

const CreatePostPage: React.FC = () => {
  const router = useRouter();

  const uploadingImagesState = useState(false);
  const [uploading] = uploadingImagesState;

  const methods = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    shouldFocusError: false,
  });

  const { register, handleSubmit, control, formState, watch } = methods;

  const files = watch("files");
  const { errors } = formState;

  const { data: tags, isLoading: fetchingTags } = trpc.useQuery(["tags.all"], {
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: createPresignedUrl } = trpc.useMutation(
    "attachments.create-presigned-url"
  );

  const { uploadTagImages } = useUploadTagImagesToS3();

  const uploadAttachment = async (postId: string, file: File) => {
    const name = file?.name || "Uploaded attachment";
    const type = file?.type || "unknown";
    const randomKey = uuid();

    const { url, fields } = await createPresignedUrl({
      postId,
      name,
      type,
      randomKey,
    });

    await uploadFileToS3(url, fields, file);
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
    async (values: CreatePostInput) => {
      const tagsToCreate = values.tags.filter(
        (tag) => !!tag.backgroundImageFile && !!tag.avatarFile
      );

      const filteredCreatedTags = await Promise.all(
        tagsToCreate.map(async (tag) => {
          const urls = await uploadTagImages(tag.name, {
            avatar: tag.avatarFile as File,
            banner: tag.backgroundImageFile as File,
          });

          const filteredTag = {
            ...tag,
            avatar: urls.avatarUrl as string,
            backgroundImage: urls.backgroundUrl as string,
          };

          return filteredTag;
        })
      );

      const tagsToSend = values.tags
        .filter((tag) => tagsToCreate.indexOf(tag) === -1)
        .concat(filteredCreatedTags);

      // parsing tag payload removing files, because we do not
      // need them on the server.
      tagsToSend.forEach((tag) => {
        parseTagPayload(tag);
      });

      create({
        body: values.body,
        tags: tagsToSend as typeof values.tags,
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
    [create, uploadTagImages]
  );

  useEffect(() => {
    if (createError) toast.error(createError?.message);
  }, [createError]);

  return (
    <>
      <MetaTags title="New post" />
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex w-full max-w-3xl flex-col gap-10"
        >
          <h1 className="text-center text-2xl font-medium">Create a post</h1>

          <Field error={errors.title}>
            <TextInput
              variant="primary"
              sizeVariant="lg"
              type="text"
              placeholder="your post title"
              className="rounded-md"
              {...register("title")}
            />
          </Field>

          <Field error={errors.body}>
            <MarkdownEditor
              uploadingState={uploadingImagesState}
              placeholder="your post content - you can use markdown!"
              control={control}
              name="body"
              imageUploadTip
            />
          </Field>

          <LinkInput />

          <CreatePoll />

          <Dropzone />

          <SelectTags
            control={control}
            initialTags={tags}
            name="tags"
            error={errors.tags}
          />

          <Button
            className="mx-auto flex w-full min-w-fit justify-center rounded-lg sm:w-6/12"
            variant="primary"
            type="submit"
            loading={isLoading || uploading}
            disabled={fetchingTags}
          >
            Create
          </Button>
        </form>
      </FormProvider>
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
