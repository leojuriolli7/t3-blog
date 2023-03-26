import { trpc } from "@utils/trpc";
import { Poll } from "@utils/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect } from "react";
import { MdOutlineCheckBox } from "react-icons/md";
import { toast } from "react-toastify";
import { uuid } from "uuidv4";
import ShouldRender from "../ShouldRender";
import PollOption from "./PollOption";

type Props = {
  poll?: Poll;
};

function getVoterPercentage(optionVoters?: number, totalVoters?: number) {
  const opt = optionVoters || 0;
  const total = totalVoters || 0;
  const numberResult = (opt / total) * 100;
  const formattedNumber = Math.floor(numberResult);

  return `${formattedNumber}%`;
}

const PollView: React.FC<Props> = ({ poll }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const postId = router.query.postId as string;
  const utils = trpc.useContext();

  const { mutate: voteOnPoll, isLoading: voting } = trpc.useMutation(
    ["posts.vote-on-poll"],
    {
      async onMutate({ optionId, postId }) {
        await utils.cancelQuery(["posts.single-post", { postId }]);

        const prevData = utils.getQueryData(["posts.single-post", { postId }]);

        utils.setQueryData(["posts.single-post", { postId }], (old) => {
          const options = [...old!.poll!.options];

          const changedOptionIndex = options.findIndex(
            (option) => option.id === optionId
          );

          const mockedUser = {
            id: uuid(),
            name: "mock",
            email: "mock",
            emailVerified: null,
            image: null,
            bio: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          options[changedOptionIndex].votedByMe = true;
          options[changedOptionIndex].voters = [
            ...options[changedOptionIndex].voters,
            mockedUser,
          ];

          return {
            ...old!,
            poll: {
              title: old!.poll!.title,
              alreadyVoted: true,
              voters: (old!.poll?.voters || 0) + 1,
              id: old!.poll!.id,
              postId,
              options,
            },
          };
        });

        return { prevData };
      },
      onSuccess: () => {
        utils.invalidateQueries([
          "posts.single-post",
          {
            postId,
          },
        ]);
      },
    }
  );

  const handleVote = useCallback(
    (id: string) => () => {
      if (!!session?.user.id) {
        return voteOnPoll({
          optionId: id,
          postId,
        });
      }

      return toast.error("Please login to vote on a poll");
    },
    [postId, session?.user.id, voteOnPoll]
  );

  return (
    <div className="w-full ring-1 ring-neutral-300 dark:ring-0 dark:bg-neutral-900 p-4">
      <h2 className="text-lg font-bold">{poll?.title}</h2>

      <div className="p-2 w-full flex flex-col gap-2">
        {poll?.options.map((option) => (
          <PollOption
            key={option.id}
            alreadyVoted={!!poll?.alreadyVoted}
            disabled={voting}
            onClick={handleVote(option.id)}
            option={option}
            percentage={getVoterPercentage(option.voters?.length, poll?.voters)}
          />
        ))}
        <p className="w-full text-right">
          {poll?.voters} {poll!.voters !== 1 ? "Votes" : "Vote"}
        </p>
      </div>
    </div>
  );
};

export default PollView;
