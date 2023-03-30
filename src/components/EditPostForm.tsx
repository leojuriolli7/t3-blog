import { useForm, FormProvider } from "react-hook-form";
import { createPostSchema, UpdatePostInput } from "@schema/post.schema";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import { trpc } from "@utils/trpc";
import React, { useCallback, useEffect } from "react";
import { SinglePost } from "@utils/types";
import { useRouter } from "next/router";
import MarkdownEditor from "./MarkdownEditor";
import Field from "./Field";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectTags from "./SelectTags";
import Link from "./Link";
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
  const { data: tags, isLoading: fetchingTags } = trpc.useQuery(
    ["posts.tags"],
    {
      ssr: false,
      refetchOnWindowFocus: false,
    }
  );

  const allTags = tags?.map((tag) => tag.name);
  const currentTags = post?.tags?.map((tag) => tag.name);

  const methods = useForm<UpdatePostInput>({
    resolver: zodResolver(createPostSchema),
    shouldFocusError: false,
    defaultValues: {
      body: post?.body,
      title: post?.title,
    },
  });

  const { errors } = methods.formState;

  const {
    mutate: update,
    isLoading: updating,
    error: updateError,
  } = trpc.useMutation(["posts.update-post"], {
    onMutate: async ({ postId, tags, body, title, link }) => {
      await utils.cancelQuery(["posts.single-post", { postId }]);

      const prevData = utils.getQueryData(["posts.single-post", { postId }]);

      const mappedTags = tags.map((tag) => ({
        name: tag,
        id: uuid(),
      }));

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
        ...(body && {
          body,
        }),
        ...(title && {
          title,
        }),
        link: formattedLink,
        tags: mappedTags,
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
      methods.setValue("body", post?.body);
      methods.setValue("title", post?.title);
    }
  }, [post, methods]);

  useEffect(() => {
    if (updateError) toast.error(updateError?.message);
  }, [updateError]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-full mx-auto flex flex-col items-center gap-10"
      >
        <Field error={errors.title}>
          <TextInput
            variant="primary"
            sizeVariant="lg"
            type="text"
            placeholder="your post title"
            {...methods.register("title")}
          />
        </Field>

        <Field error={errors.body}>
          <MarkdownEditor control={methods.control} name="body" />
        </Field>

        <Link initialLink={post?.link} />

        <div className="w-full">
          <SelectTags
            name="tags"
            control={methods.control}
            error={errors.tags}
            initialTags={allTags}
            initialSelectedTags={currentTags}
          />
        </div>

        <Button
          variant="primary"
          className="sm:w-6/12 w-full min-w-fit flex justify-center"
          type="submit"
          loading={updating}
          disabled={fetchingTags}
        >
          Update
        </Button>
      </form>
    </FormProvider>
  );
};

export default EditPostForm;
