import { useForm, FormProvider } from "react-hook-form";
import { UpdatePostInput, updatePostSchema } from "@schema/post.schema";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import { trpc } from "@utils/trpc";
import React, { useCallback, useEffect, useState } from "react";
import type { SinglePost } from "@utils/types";
import { useRouter } from "next/router";
import MarkdownEditor from "./MarkdownEditor";
import Field from "./Field";
import { zodResolver } from "@hookform/resolvers/zod";
import LinkInput from "./LinkInput";
import Button from "./Button";
import TextInput from "./TextInput";

type Props = {
  post?: SinglePost;
  onFinish: () => void;
};

const EditPostForm: React.FC<Props> = ({ post, onFinish }) => {
  const utils = trpc.useContext();
  const router = useRouter();
  const postId = router.query.postId as string;

  const uploadingImagesState = useState(false);
  const [uploading] = uploadingImagesState;

  const methods = useForm<UpdatePostInput>({
    resolver: zodResolver(updatePostSchema),
    shouldFocusError: false,
    defaultValues: {
      body: post?.markdownBody,
      title: post?.title,
    },
  });

  const { errors } = methods.formState;

  const {
    mutate: update,
    isLoading: updating,
    error: updateError,
  } = trpc.useMutation(["posts.update-post"], {
    onMutate: async ({ postId, link }) => {
      await utils.cancelQuery(["posts.single-post", { postId }]);

      const prevData = utils.getQueryData(["posts.single-post", { postId }]);

      const formattedLink = link?.url
        ? {
            image: link.image,
            title: link.title,
            description: link.description,
            url: link.url,
            publisher: link?.publisher || null,
            postId,
            id: uuid(),
          }
        : undefined;

      utils.setQueryData(["posts.single-post", { postId }], (old) => ({
        ...old!,
        link: formattedLink,
      }));

      return { prevData };
    },
    onError: (err, newData, context) => {
      utils.setQueryData(
        ["posts.single-post"],
        context?.prevData as SinglePost
      );
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
      methods.setValue("body", post?.markdownBody);
      methods.setValue("title", post?.title);
      methods.setValue("postId", post?.id as string);
    }
  }, [post, methods]);

  useEffect(() => {
    if (updateError) toast.error(updateError?.message);
  }, [updateError]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto flex w-full flex-col items-center gap-10"
      >
        <Field error={errors.title}>
          <TextInput
            variant="primary"
            sizeVariant="lg"
            type="text"
            placeholder="your post title"
            className="rounded-md"
            {...methods.register("title")}
          />
        </Field>

        <Field error={errors.body}>
          <MarkdownEditor
            uploadingState={uploadingImagesState}
            control={methods.control}
            name="body"
          />
        </Field>

        <LinkInput initialLink={post?.link} />

        <Button
          variant="primary"
          className="flex w-full min-w-fit justify-center rounded-lg sm:w-6/12"
          type="submit"
          loading={updating || uploading}
        >
          Update
        </Button>
      </form>
    </FormProvider>
  );
};

export default EditPostForm;
