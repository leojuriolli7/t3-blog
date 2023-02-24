import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "@utils/trpc";
import ReactMarkdown from "@components/ReactMarkdown";
import { useRouter } from "next/router";
import CommentSection from "@components/CommentSection";
import { useUserContext } from "src/context/user.context";
import useGetDate from "src/hooks/useGetDate";
import ShouldRender from "@components/ShouldRender";
import MainLayout from "@components/MainLayout";
import Skeleton from "@components/Skeleton";
import ActionButton from "@components/ActionButton";
import EditPostForm from "@components/EditPostForm";

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

  const toggleIsEditing = useCallback(() => setIsEditing((prev) => !prev), []);

  useEffect(() => {
    if (!user) setIsEditing(false);
  }, [user]);

  return (
    <MainLayout>
      <main className="relative w-full flex flex-col gap-10 bg-slate-100 shadow-md p-12 dark:bg-zinc-800">
        <ShouldRender if={data && loggedUserCreatedPost}>
          <div className="absolute -top-2 right-2 flex gap-3 align-center">
            <ActionButton
              action={isEditing ? "close" : "edit"}
              onClick={toggleIsEditing}
            />

            <ActionButton
              onClick={onClickDeletePost}
              disabled={deleting}
              action="delete"
            />
          </div>
        </ShouldRender>

        <ShouldRender if={isEditing}>
          <EditPostForm onFinish={toggleIsEditing} post={data} />
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
              <p onClick={toggleDateType} className="w-fit select-none">
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
