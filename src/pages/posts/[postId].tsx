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
import { Post } from "@utils/types";
import TagList from "@components/TagList";

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

  const { data, isLoading } = trpc.useQuery(
    [
      "posts.single-post",
      {
        postId,
      },
    ],
    {
      refetchOnWindowFocus: false,
    }
  );

  const loggedUserCreatedPost = session?.user?.id === data?.userId;

  const { mutate: likePost, error: likeError } = trpc.useMutation(
    ["likes.like-post"],
    {
      onMutate: async ({ dislike, postId }) => {
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await utils.cancelQuery(["posts.single-post", { postId }]);

        const prevData = utils.getQueryData(["posts.single-post", { postId }]);

        const userHadAlreadyLiked = prevData!.likedByMe;
        const userHadDisliked = prevData!.dislikedByMe;

        // User undoing dislike by clicking dislike button again.
        if (userHadDisliked && dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            dislikes: prevData!.dislikes - 1,
            dislikedByMe: false,
          }));
        }

        // User disliking post.
        if (!userHadDisliked && dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            dislikes: prevData!.dislikes + 1,
            dislikedByMe: true,
          }));
        }

        // User disliking post and undoing previous like.
        if (userHadAlreadyLiked && dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            dislikes: prevData!.dislikes + 1,
            likedByMe: false,
            dislikedByMe: true,
            likes: prevData!.likes - 1,
          }));
        }

        // User liking post.
        if (!userHadAlreadyLiked && !dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            likes: prevData!.likes + 1,
            likedByMe: true,
          }));
        }

        // User liking post and undoing previous dislike.
        if (userHadDisliked && !dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            likes: prevData!.likes + 1,
            likedByMe: true,
            dislikedByMe: false,
            dislikes: prevData!.dislikes - 1,
          }));
        }

        // User undoing like by clicking like button again.
        if (userHadAlreadyLiked && !dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            likes: prevData!.likes - 1,
            likedByMe: false,
          }));
        }

        // Return the previous data so we can revert if something goes wrong
        return { prevData };
      },
      // If the mutation fails,
      // use the context returned from onMutate to roll back
      onError: (err, newData, context) => {
        utils.setQueryData(["posts.single-post"], context?.prevData as Post);
      },
      // Always refetch after error or success
      onSettled: () => {
        // This will refetch the single-post query.
        utils.invalidateQueries([
          "posts.single-post",
          {
            postId,
          },
        ]);
      },
    }
  );

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
              disabled={isLoading}
              label={data?.likes}
              onClick={handleLikeOrDislikePost(false)}
              likedOrDislikedByMe={data?.likedByMe}
            />

            <LikeButton
              disabled={isLoading}
              label={data?.dislikes}
              onClick={handleLikeOrDislikePost(true)}
              dislike
              likedOrDislikedByMe={data?.dislikedByMe}
            />
          </div>
        </main>

        <div className="w-full -mb-10">
          <h2 className="text-lg font-medium">Tags</h2>

          <ShouldRender if={data?.tags?.length || isLoading}>
            <TagList tags={data?.tags} loading={isLoading} />
          </ShouldRender>
        </div>

        <CommentSection />
      </MainLayout>
    </>
  );
};

export default SinglePostPage;
