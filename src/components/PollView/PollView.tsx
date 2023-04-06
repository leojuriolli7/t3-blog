import { trpc } from "@utils/trpc";
import { Poll } from "@types/index";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import PollOption from "./PollOption";

type Props = {
  poll?: Poll;
};

function getVoterPercentage(optionVoters?: number, totalVoters?: number) {
  const opt = optionVoters || 0;
  const total = totalVoters || 0;
  const numberResult = (opt / total) * 100;
  const roundedNumber = Math.round(numberResult * 10) / 10;

  return `${roundedNumber}%`;
}

const PollView: React.FC<Props> = ({ poll }) => {
  const { data: session, status } = useSession();
  const loadingSession = status === "loading";

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

      return toast.info("Please login to vote on a poll");
    },
    [postId, session?.user.id, voteOnPoll]
  );

  return (
    <div
      className="w-full ring-1 ring-neutral-300 dark:ring-0 bg-white dark:bg-neutral-900 p-4"
      aria-label="Poll"
    >
      <h2 className="text-lg font-bold" aria-label="Poll title">
        {poll?.title}
      </h2>

      <ul className="p-2 w-full flex flex-col gap-2">
        {poll?.options.map((option) => (
          <PollOption
            key={option.id}
            alreadyVoted={!!poll?.alreadyVoted}
            disabled={voting || loadingSession}
            onClick={handleVote(option.id)}
            option={option}
            percentage={getVoterPercentage(option.voters?.length, poll?.voters)}
          />
        ))}
      </ul>
      <p className="w-full text-right pr-2">
        {poll?.voters} {poll!.voters !== 1 ? "Votes" : "Vote"}
      </p>
    </div>
  );
};

export default PollView;
