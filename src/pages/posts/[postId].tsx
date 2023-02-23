import React, { useCallback } from "react";
import { trpc } from "@utils/trpc";
import Error from "next/error";
import ReactMarkdown from "@components/ReactMarkdown";
import { useRouter } from "next/router";
import CommentSection from "@components/CommentSection";
import { useUserContext } from "src/context/user.context";
import useGetDate from "src/hooks/useGetDate";
import ShouldRender from "@components/ShouldRender";
import { AiFillDelete } from "react-icons/ai";
import MainLayout from "@components/MainLayout";
import Skeleton from "@components/Skeleton";

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

  return (
    <MainLayout>
      <main className="relative w-full flex flex-col gap-10 bg-slate-100 shadow-md p-12 dark:bg-zinc-800">
        <ShouldRender if={data && loggedUserCreatedPost}>
          <button
            onClick={onClickDeletePost}
            disabled={deleting}
            className="absolute -top-2 right-2 bg-teal-100 dark:bg-teal-900 p-2 shadow-lg hover:opacity-70"
          >
            <AiFillDelete className=" text-emerald-500" size={23} />
          </button>
        </ShouldRender>

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
      </main>

      <CommentSection />
    </MainLayout>
  );
};

export default SinglePostPage;
