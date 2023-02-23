import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "@utils/trpc";
import ReactMarkdown from "@components/ReactMarkdown";
import { useRouter } from "next/router";
import CommentSection from "@components/CommentSection";
import { useUserContext } from "src/context/user.context";
import useGetDate from "src/hooks/useGetDate";
import ShouldRender from "@components/ShouldRender";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import MainLayout from "@components/MainLayout";
import Skeleton from "@components/Skeleton";
import { useForm } from "react-hook-form";
import { UpdatePostInput } from "src/schema/post.schema";

type ReplyData = {
  parentId: string;
  name: string;
};

export type ReplyingTo = ReplyData | undefined;

const SinglePostPage: React.FC = () => {
  const router = useRouter();
  const postId = router.query.postId as string;
  const user = useUserContext();
  const utils = trpc.useContext();

  const { data, isLoading } = trpc.useQuery([
    "posts.single-post",
    {
      postId,
    },
  ]);

  const loggedUserCreatedPost = user?.id === data?.userId;

  const { date, toggleDateType, isDistance } = useGetDate(data?.createdAt);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { register, handleSubmit, watch, setValue } = useForm<UpdatePostInput>({
    defaultValues: {
      body: data?.body,
      title: data?.title,
    },
  });

  const { mutate: update, isLoading: updating } = trpc.useMutation(
    ["posts.update-post"],
    {
      onSuccess: () => {
        utils.invalidateQueries([
          "posts.single-post",
          {
            postId,
          },
        ]);
      },
    }
  );

  const watchBody = watch("body");
  const watchTitle = watch("title");

  const shouldBlockUserFromUpdating =
    !watchBody ||
    !watchTitle ||
    (watchTitle === data?.title && watchBody === data?.body);

  const toggleIsEditing = useCallback(() => setIsEditing((prev) => !prev), []);

  const onSubmit = useCallback(
    (values: UpdatePostInput) => {
      update({
        ...values,
        postId,
      });

      setIsEditing(false);
    },
    [update, postId]
  );

  const { mutate: deletePost, isLoading: deleting } = trpc.useMutation(
    ["posts.delete-post"],
    {
      onSuccess: () => {
        router.push("/");

        // This will refetch the home-page posts.
        utils.invalidateQueries(["posts.posts"]);
      },
    }
  );

  const onClickDeletePost = useCallback(
    () =>
      deletePost({
        postId,
      }),
    [deletePost, postId]
  );

  useEffect(() => {
    if (data) {
      setValue("body", data?.body);
      setValue("title", data?.title);
    }
  }, [data]);

  return (
    <MainLayout>
      <main className="relative w-full flex flex-col gap-10 bg-slate-100 shadow-md p-12 dark:bg-zinc-800">
        <ShouldRender if={data && loggedUserCreatedPost}>
          <div className="absolute -top-2 right-2 flex gap-3 align-center">
            <button
              onClick={toggleIsEditing}
              className="bg-teal-100 dark:bg-teal-900 p-2 shadow-lg hover:opacity-70"
            >
              <ShouldRender if={!isEditing}>
                <AiFillEdit className=" text-emerald-500" size={23} />
              </ShouldRender>

              <ShouldRender if={isEditing}>
                <MdClose className=" text-emerald-500" size={23} />
              </ShouldRender>
            </button>

            <button
              onClick={onClickDeletePost}
              disabled={deleting}
              className=" bg-teal-100 dark:bg-teal-900 p-2 shadow-lg hover:opacity-70"
            >
              <AiFillDelete className=" text-emerald-500" size={23} />
            </button>
          </div>
        </ShouldRender>

        <ShouldRender if={isEditing}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full mx-auto flex flex-col items-center gap-10"
          >
            <input
              type="text"
              placeholder="your post title"
              className="bg-gray-300 p-3 w-full dark:bg-neutral-900"
              {...register("title")}
            />

            <textarea
              className="bg-gray-300 p-3 w-full h-44 dark:bg-neutral-900"
              placeholder="your post content"
              {...register("body")}
            />

            <button
              className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
              type="submit"
              disabled={updating || shouldBlockUserFromUpdating}
            >
              Update
            </button>
          </form>
        </ShouldRender>

        <ShouldRender if={!isEditing}>
          <ReactMarkdown
            className="prose text-4xl font-bold"
            heading
            loading={isLoading}
          >
            {data?.title}
          </ReactMarkdown>

          <div>
            <ShouldRender if={isLoading}>
              <Skeleton width="w-1/2" />
            </ShouldRender>

            <ShouldRender if={!isLoading}>
              <p onClick={toggleDateType}>
                By {data?.user?.name}
                <span className="cursor-pointer">{` ${
                  isDistance ? "" : "at"
                } ${date}`}</span>
              </p>
            </ShouldRender>
          </div>

          <ReactMarkdown className="prose" lines={5} loading={isLoading}>
            {data?.body}
          </ReactMarkdown>
        </ShouldRender>
      </main>

      <CommentSection />
    </MainLayout>
  );
};

export default SinglePostPage;
