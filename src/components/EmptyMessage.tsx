import Lottie from "react-lottie";
import NoPostsAnimation from "@public/static/ghost.json";
import Link from "next/link";

type Props = {
  message: string;
  redirect?: string;
  redirectMessage?: string;
};

const LOTTIE_OPTIONS = {
  loop: true,
  autoplay: true,
  animationData: NoPostsAnimation,
};

const EmptyMessage: React.FC<Props> = ({
  message,
  redirect,
  redirectMessage = "Go back to home",
}) => {
  return (
    <div className="flex flex-col items-center">
      <Lottie options={LOTTIE_OPTIONS} width={232} height={207} />
      <p className="text-center">{message}</p>
      <Link href={redirect || "/"} legacyBehavior>
        <a className="text-emerald-500 text-center underline mt-2">
          {redirectMessage}
        </a>
      </Link>
    </div>
  );
};

export default EmptyMessage;
