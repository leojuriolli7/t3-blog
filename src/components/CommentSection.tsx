import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import React from "react";
import CommentField from "./CommentField";
import Comments from "./Comments";
import formatComments from "@utils/formatComments";
import ShouldRender from "./ShouldRender";

const CommentSection: React.FC = () => {
  const router = useRouter();
  const postId = router.query.postId as string;

  const { data } = trpc.useQuery(
    [
      "comments.all-comments",
      {
        postId,
      },
    ],
    {
      refetchOnWindowFocus: false,
      // Disabling ssr here as the main focus of the
      // page is the post itself, the comments can load afterwards.
      ssr: false,
    }
  );

  const formattedComments = formatComments(data || []);

  return (
    <div className="w-full">
      <CommentField />
      <ShouldRender if={data}>
        <div className="w-full mt-10">
          <Comments comments={formattedComments} />
        </div>
      </ShouldRender>
    </div>
  );
};

export default CommentSection;
