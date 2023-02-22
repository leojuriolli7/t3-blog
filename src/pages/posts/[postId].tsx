import React from "react";
import { trpc } from "@utils/trpc";
import Error from "next/error";
import { useRouter } from "next/router";
import CommentSection from "@components/CommentSection";

type ReplyData = {
  parentId: string;
  name: string;
};

export type ReplyingTo = ReplyData | undefined;

const SinglePostPage: React.FC = () => {
  const router = useRouter();
  const postId = router.query.postId as string;

  const { data, isLoading, error } = trpc.useQuery([
    "posts.single-post",
    {
      postId,
    },
  ]);

  if (!data && isLoading) return <p>Loading...</p>;

  if (!data || error) return <Error statusCode={404} />;

  return (
    <div className="mt-20 w-full">
      <div className="w-8/12 max-w-xl mx-auto">
        <main className="w-full flex flex-col gap-10 bg-slate-100 shadow-md p-12">
          <h1 className="text-xl font-medium">{data?.title}</h1>

          <p>{data?.body}</p>
        </main>

        <CommentSection />
      </div>
    </div>
  );
};

export default SinglePostPage;
