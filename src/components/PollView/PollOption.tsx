import ShouldRender from "@components/ShouldRender";
import { User } from "@prisma/client";
import { Fragment, useEffect, useRef } from "react";
import { MdOutlineCheckBox } from "react-icons/md";

type Props = {
  option: {
    votedByMe?: boolean | undefined;
    id: string;
    title: string;
    color: string;
    postId: string;
    pollId: string;
    voters: User[];
  };
  disabled: boolean;
  alreadyVoted: boolean;
  onClick: () => void;
  percentage: string;
};

const PollOption: React.FC<Props> = ({
  option,
  disabled,
  onClick,
  alreadyVoted,
  percentage,
}) => {
  const optionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (alreadyVoted && optionRef?.current) {
        optionRef.current.style.width = percentage;
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyVoted]);

  return (
    <Fragment key={option.id}>
      <ShouldRender if={!alreadyVoted}>
        <button
          disabled={disabled}
          onClick={onClick}
          className="p-2 cursor-pointer hover:opacity-80 border-2 text-ellipsis line-clamp-1 overflow-hidden break-all text-sm sm:text-base"
          style={{
            borderColor: option.color,
            backgroundColor: `${option.color}50`,
          }}
        >
          {option.title}
        </button>
      </ShouldRender>

      <ShouldRender if={alreadyVoted}>
        <div className="w-full relative p-2 select-none ring-1 dark:ring-neutral-700 ring-inset ring-gray-300">
          <div className="flex w-full justify-between gap-2">
            <p className="relative z-10 text-ellipsis line-clamp-1 overflow-hidden break-all text-sm sm:text-base">
              {option.title}
            </p>

            <div className="flex items-center gap-1 relative z-10">
              <p>{percentage}</p>

              <ShouldRender if={option.votedByMe}>
                <MdOutlineCheckBox
                  className="text-black dark:text-white"
                  size={20}
                  title="Your vote"
                />
              </ShouldRender>
            </div>
          </div>
          <div
            ref={optionRef}
            className="absolute h-full top-0 left-0 vote-progress"
            style={{
              backgroundColor: `${option.color}90`,
              width: 0,
              transition: "width 1.5s",
            }}
          />
        </div>
      </ShouldRender>
    </Fragment>
  );
};

export default PollOption;
