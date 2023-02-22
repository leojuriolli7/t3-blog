import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import React from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import formatComments from "@utils/formatComments";

const CommentSection: React.FC = () => {
  const router = useRouter();
  const postId = router.query.postId as string;

  const { data } = trpc.useQuery([
    "comments.all-comments",
    {
      postId,
    },
  ]);

  const formattedComments = formatComments(data || []);

  return (
    <div>
      <CommentForm />
      {data && (
        <div className="w-full mt-10">
          <CommentList comments={formattedComments} />
          <CommentList comments={formattedComments} />
        </div>
      )}
    </div>
  );
};

export default CommentSection;
