import { AiFillHeart } from "react-icons/ai";

type Props = {
  disabled: boolean;
  onClick: () => void;
  favoritedByMe?: boolean;
};

const FavoriteButton: React.FC<Props> = (props) => {
  const { favoritedByMe, disabled, onClick } = props;

  const buttonDescription = favoritedByMe
    ? "Unfavorite this post"
    : "Favorite this post";

  return (
    <button
      disabled={disabled}
      title={buttonDescription}
      aria-label={buttonDescription}
      className={`flex gap-2 rounded-md bg-emerald-500 dark:bg-teal-900 sm:p-2 px-2 py-1 hover:opacity-80 shadow-lg`}
      onClick={onClick}
    >
      <AiFillHeart
        size={22}
        className={`${
          favoritedByMe
            ? "text-emerald-800 dark:text-emerald-400"
            : "text-white"
        }`}
      />
    </button>
  );
};

export default FavoriteButton;
