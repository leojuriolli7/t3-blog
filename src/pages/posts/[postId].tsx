import React from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { generateSSGHelper } from "@server/ssgHepers";
import { PostDetails } from "@components/PostDetails";
import { PageWrapper } from "@components/PageWrapper";

const SinglePostPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { postId } = props;

  const router = useRouter();

  const { data, isLoading } = trpc.posts.singlePost.useQuery(
    {
      postId,
    },
    {
      onSettled(data) {
        // if post not found, 404
        if (!data?.id) router.push("/404");
      },
      refetchOnWindowFocus: false,
    }
  );

  return <PostDetails data={data} isLoading={isLoading} postId={postId} />;
};

SinglePostPage.PageWrapper = PageWrapper;
export default SinglePostPage;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ postId: string }>
) {
  const { req, res } = context;

  const ssg = await generateSSGHelper({ req, res });
  const postId = context.params?.postId as string;

  await ssg.posts.singlePost.prefetch({
    postId,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId,
    },
  };
}
