import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "@utils/trpc";
import ReactMarkdown from "@components/ReactMarkdown";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import CommentSection from "@components/CommentSection";
import LikeButton from "@components/LikeButton";
import useGetDate from "src/hooks/useGetDate";
import ShouldRender from "@components/ShouldRender";
import MainLayout from "@components/MainLayout";
import Skeleton from "@components/Skeleton";
import ActionButton from "@components/ActionButton";
import EditPostForm from "@components/EditPostForm";
import { useSession } from "next-auth/react";
import MetaTags from "@components/MetaTags";
import Link from "next/link";

type ReplyData = {
  parentId: string;
  name: string;
};

export type ReplyingTo = ReplyData | undefined;

const SinglePostPage: React.FC = () => {
  const router = useRouter();
  const postId = router.query.postId as string;
  const { data: session, status: sessionStatus } = useSession();
  const utils = trpc.useContext();

  const { data, isLoading } = trpc.useQuery([
    "posts.single-post",
    {
      postId,
    },
  ]);

  const loggedUserCreatedPost = session?.user?.id === data?.userId;

  const {
    mutateAsync: likePost,
    isLoading: liking,
    error: likeError,
  } = trpc.useMutation(["likes.like-post"], {
    onSuccess: () => {
      // This will refetch the single-post query.
      utils.invalidateQueries([
        "posts.single-post",
        {
          postId,
        },
      ]);
    },
  });

  const handleLikeOrDislikePost = useCallback(
    (dislike: boolean) => () => {
      if (!session?.user) {
        return toast.info("Login to like or dislike posts");
      }

      if (session?.user) {
        return likePost({
          postId,
          dislike: dislike,
        });
      }
    },
    [postId, likePost, session]
  );

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
    if (sessionStatus !== "authenticated") setIsEditing(false);
  }, [sessionStatus]);

  useEffect(() => {
    if (likeError) toast.error(likeError?.message);
  }, [likeError]);

  return (
    <>
      <MetaTags title={data?.title} description={data?.body} />

      <MainLayout>
        <main className="relative w-full flex flex-col gap-10 bg-slate-100 shadow-md p-8 xs:p-12 dark:bg-zinc-800">
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
              className="prose xs:text-4xl text-3xl font-bold"
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
                <p className="w-fit">
                  By{" "}
                  <Link href={`/users/${data?.user?.id}`} passHref>
                    <a
                      title="Go to user's profile"
                      className="underline text-emerald-700 dark:text-emerald-500 font-bold"
                    >
                      {data?.user?.name}
                    </a>
                  </Link>
                  <ShouldRender if={data?.user?.id === session?.user.id}>
                    <span className=" text-emerald-700 dark:text-emerald-500">
                      {" "}
                      (You)
                    </span>
                  </ShouldRender>
                  <span
                    onClick={toggleDateType}
                    className="cursor-pointer select-none"
                    role="button"
                    aria-label="Change date visualization type"
                    title="Change date visualization type"
                  >{` ${isDistance ? "" : "at"} ${date}`}</span>
                </p>
              </ShouldRender>
            </div>

            <ReactMarkdown className="prose" lines={5} loading={isLoading}>
              {data?.body}
            </ReactMarkdown>
          </ShouldRender>

          <div className="flex gap-3 absolute -bottom-4 left-4">
            <LikeButton
              disabled={liking || isLoading}
              label={data?.likes}
              onClick={handleLikeOrDislikePost(false)}
              likedOrDislikedByMe={data?.likedByMe}
            />

            <LikeButton
              disabled={liking || isLoading}
              label={data?.dislikes}
              onClick={handleLikeOrDislikePost(true)}
              dislike
              likedOrDislikedByMe={data?.dislikedByMe}
            />
          </div>
        </main>

        <CommentSection />
      </MainLayout>
    </>
  );
};

export default SinglePostPage;
