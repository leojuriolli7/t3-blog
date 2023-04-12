import { useMemo } from "react";
import { AiFillDislike, AiFillLike } from "react-icons/ai";
import ShouldRender from "./ShouldRender";

type Props = {
  dislike?: boolean;
  disabled: boolean;
  onClick: () => void;
  label?: number;
  likedOrDislikedByMe?: boolean;
  vertical?: boolean;
};

const LikeButton: React.FC<Props> = (props) => {
  const { vertical, label, likedOrDislikedByMe, disabled, onClick, dislike } =
    props;

  const buttonDescription = useMemo(() => {
    if (dislike && !likedOrDislikedByMe) return "Dislike this post";

    if (dislike && likedOrDislikedByMe) return "Undo dislike on this post";

    if (!dislike && likedOrDislikedByMe) return "Undo like on this post";

    if (!dislike && !likedOrDislikedByMe) return "Like this post";
  }, [likedOrDislikedByMe, dislike]);

  return (
    <button
      disabled={disabled}
      title={buttonDescription}
      aria-label={buttonDescription}
      className={`flex gap-2 ${
        vertical ? "flex-col items-center" : ""
      } bg-emerald-500 dark:bg-teal-900 rounded-md sm:p-2 px-2 py-1 hover:opacity-80 shadow-lg`}
      onClick={onClick}
    >
      <ShouldRender if={dislike}>
        <AiFillDislike
          size={22}
          className={`${
            likedOrDislikedByMe
              ? "text-emerald-800 dark:text-emerald-400"
              : "text-white"
          }`}
        />
      </ShouldRender>

      <ShouldRender if={!dislike}>
        <AiFillLike
          size={22}
          className={`${
            likedOrDislikedByMe
              ? "text-emerald-800 dark:text-emerald-400"
              : "text-white"
          }`}
        />
      </ShouldRender>

      <p
        className={`${
          likedOrDislikedByMe
            ? "text-emerald-800 dark:text-emerald-400"
            : "text-white"
        }`}
      >
        {label}
      </p>
    </button>
  );
};

export default LikeButton;
