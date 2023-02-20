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

  if (isLoading) return <p>Loading...</p>;

  if (!data || error) return <Error statusCode={404} />;

  return (
    <div>
      <h1>{data?.title}</h1>

      <p>{data?.body}</p>
    </div>
  );
};

export default SinglePostPage;
