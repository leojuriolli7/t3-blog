import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/router";
import { FaRegUser, FaUser } from "react-icons/fa";
import { IconType } from "react-icons";
import {
  AiFillHeart,
  AiFillHome,
  AiFillLike,
  AiFillTag,
  AiOutlineHeart,
  AiOutlineHome,
  AiOutlineLike,
  AiOutlineTag,
} from "react-icons/ai";
import { ButtonLink } from "@components/Button";
import BeatLoader from "@components/BeatLoader";
import { useSession } from "next-auth/react";
import ShouldRender from "@components/ShouldRender";
import { HiOutlineUsers, HiUsers } from "react-icons/hi";
import ThemeButton from "./ThemeButton";
import packageJson from "@package";
import { useMemo } from "react";
import { MdAdd } from "react-icons/md";

type ItemProps = {
  path: string;
  defaultIcon: IconType;
  activeIcon: IconType;
  title: string;
  subtitle: string;
  className?: string;
};

const iconProps = {
  size: 27,
  className: "text-neutral-800 dark:text-white mt-1",
};

const Item: React.FC<ItemProps> = ({
  defaultIcon,
  activeIcon,
  path,
  subtitle,
  className = "",
  title,
}) => {
  const router = useRouter();
  const currentPath = router.asPath;

  const isActive = useMemo(() => {
    if (path === "/") return path === currentPath;

    // This is necessary so that path with query params is still is recognized.
    return currentPath.includes(path);
  }, [currentPath, path]);

  const Icon = isActive ? activeIcon : defaultIcon;

  return (
    <Link
      className={`w-auto flex gap-2 rounded-full p-3 hover:ring hover:ring-neutral-100 dark:hover:ring-0 hover:dark:bg-neutral-800 transition-all ${className}`}
      href={path}
      prefetch={false}
    >
      <Icon {...iconProps} />

      <div>
        <p className={clsx("text-lg", isActive && "font-bold")}>{title}</p>
        <p className=" text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
    </Link>
  );
};

// TO-DO: Semantics (add <ul>, <li>)
export const SidebarContent = () => {
  const router = useRouter();
  const session = useSession();

  const callbackRoute = router.isReady && !!router.asPath ? router.asPath : "/";
  const filteredRoute = callbackRoute.split("?")[0];
  const callbackUrl = encodeURIComponent(filteredRoute);

  return (
    <nav className="py-6 px-3 xl:mt-2 flex flex-col gap-3 w-full h-full overflow-y-auto relative">
      <Item
        defaultIcon={AiOutlineHome}
        activeIcon={AiFillHome}
        path="/"
        title="Home"
        subtitle="Go to homepage"
        className="mt-4"
      />
      <Item
        activeIcon={AiFillTag}
        defaultIcon={AiOutlineTag}
        path="/posts/tags"
        title="All tags"
        subtitle="Explore through all tags"
      />

      <ShouldRender if={session?.status === "authenticated"}>
        <Item
          activeIcon={HiUsers}
          defaultIcon={HiOutlineUsers}
          path="/posts/following"
          title="Following"
          subtitle="Posts from users you follow"
        />
        <Item
          activeIcon={AiFillLike}
          defaultIcon={AiOutlineLike}
          path="/posts/liked"
          title="Liked"
          subtitle="Your liked posts"
        />
        <Item
          activeIcon={AiFillHeart}
          defaultIcon={AiOutlineHeart}
          path="/posts/favorited"
          title="Favorites"
          subtitle="Your favorited posts"
        />
        <Item
          activeIcon={FaUser}
          defaultIcon={FaRegUser}
          path={`/users/${session?.data?.user?.id}`}
          title="Profile"
          subtitle="Go to your profile"
        />
      </ShouldRender>

      <div className="w-full mt-auto flex flex-col gap-3">
        <ShouldRender if={session?.status !== "loading"}>
          <Link
            passHref
            legacyBehavior
            href={
              session?.status === "authenticated"
                ? "/posts/new"
                : `/auth/signin?callbackUrl=${callbackUrl}`
            }
          >
            <ButtonLink
              variant="primary"
              size="lg"
              className="rounded-full flex justify-center shadow-md font-bold w-full"
            >
              {session?.status === "authenticated" ? "Create post" : "Sign in"}
            </ButtonLink>
          </Link>
        </ShouldRender>

        <ThemeButton />

        <div className="w-full flex flex-col items-center">
          <ShouldRender if={session.status === "loading"}>
            <BeatLoader className="dark:fill-white fill-neutral-900" />
          </ShouldRender>

          <ShouldRender if={session?.status === "authenticated"}>
            <Link
              passHref
              legacyBehavior
              href={`/auth/signout?callbackUrl=${callbackUrl}`}
            >
              <ButtonLink
                variant="text"
                size="lg"
                className="rounded-full w-full xl:flex justify-center mt-5 pb-0"
              >
                Logout
              </ButtonLink>
            </Link>
          </ShouldRender>
          <p className="text-xs dark:text-neutral-600 text-neutral-500 text-center mt-2">
            {packageJson.version}
          </p>
        </div>
      </div>
    </nav>
  );
};

const Sidebar = () => {
  return (
    <div className="fixed xl:block hidden left-0 w-[250px] h-screen bg-white border-zinc-300 border-x dark:border-neutral-800 dark:bg-neutral-900">
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
