import Lottie from "react-lottie";
import NoPostsAnimation from "@public/static/ghost.json";
import Link from "next/link";
import ShouldRender from "./ShouldRender";

type Props = {
  message: string;
  redirect?: string;
  redirectMessage?: string;
  hideRedirect?: boolean;
  small?: boolean;
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
  hideRedirect = false,
  small = false,
}) => {
  return (
    <div className="flex flex-col items-center">
      <Lottie
        options={LOTTIE_OPTIONS}
        width={small ? 132 : 232}
        height={small ? 107 : 207}
      />
      <p className="text-center">{message}</p>
      <ShouldRender if={!hideRedirect}>
        <Link href={redirect || "/"} legacyBehavior>
          <a className="text-emerald-500 text-center underline mt-2">
            {redirectMessage}
          </a>
        </Link>
      </ShouldRender>
    </div>
  );
};

export default EmptyMessage;
