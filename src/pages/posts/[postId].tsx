import React from "react";
import { trpc } from "@utils/trpc";
import Error from "next/error";
import { useRouter } from "next/router";

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
      <main className="w-8/12 max-w-xl mx-auto flex flex-col gap-10 bg-slate-100 shadow-md p-12">
        <h1 className="text-xl font-medium">{data?.title}</h1>

        <p>{data?.body}</p>
      </main>
    </div>
  );
};

export default SinglePostPage;
