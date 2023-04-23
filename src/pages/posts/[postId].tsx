import React from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import MainLayout from "@components/MainLayout";
import MetaTags from "@components/MetaTags";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { generateSSGHelper } from "@server/ssgHepers";
import { PostDetails } from "@components/PostDetails";

const SinglePostPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const { postId } = props;

  const router = useRouter();

  const { data, isLoading } = trpc.useQuery(
    [
      "posts.single-post",
      {
        postId,
      },
    ],
    {
      onSettled(data) {
        // if post not found, 404
        if (!data?.id) router.push("/404");
      },
      refetchOnWindowFocus: false,
    }
  );

  return (
    <MainLayout>
      <PostDetails data={data} isLoading={isLoading} postId={postId} />
    </MainLayout>
  );
};

export default SinglePostPage;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ postId: string }>
) {
  const ssg = await generateSSGHelper();
  const postId = context.params?.postId as string;

  await ssg.prefetchQuery("posts.single-post", {
    postId,
  });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId,
    },
  };
}
