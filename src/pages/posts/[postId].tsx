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

  const { data, isLoading, error } = trpc.useQuery([
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

  if (!data && isLoading) return <p>Loading...</p>;

  if (!data || error) return <Error statusCode={404} />;

  return (
    <div className="mt-20 w-full">
      <div className="w-8/12 max-w-2xl mx-auto">
        <main className="relative w-full flex flex-col gap-10 bg-slate-100 shadow-md p-12 dark:bg-zinc-800">
          <ShouldRender if={loggedUserCreatedPost}>
            <button
              onClick={onClickDeletePost}
              disabled={deleting}
              className="absolute -top-2 right-2 bg-teal-100 p-2 shadow-lg hover:opacity-70"
            >
              <AiFillDelete className=" text-emerald-500" size={23} />
            </button>
          </ShouldRender>

          <ReactMarkdown className="prose text-4xl font-bold">
            {data?.title}
          </ReactMarkdown>

          <div>
            <p onClick={toggleDateType}>
              By {data.user.name}
              <span className="cursor-pointer">{` ${
                isDistance ? "" : "at"
              } ${date}`}</span>
            </p>
          </div>

          <ReactMarkdown className="prose">{data.body}</ReactMarkdown>
        </main>

        <CommentSection />
      </div>
    </div>
  );
};

export default SinglePostPage;
