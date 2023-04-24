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
import packageJson from "@package";
import { useMemo } from "react";
import Image from "next/future/image";
import getUserDisplayName from "@utils/getUserDisplayName";
import ThemeButton from "./ThemeButton";

type ItemProps = {
  path: string;
  defaultIcon: IconType;
  activeIcon: IconType;
  title: string;
  subtitle: string;
  className?: string;
};

const iconProps = {
  className:
    "text-neutral-800 dark:text-white mt-1 xl:w-[27px] xl:h-[27px] w-[23px] h-[23pxa]",
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
    <li>
      <Link
        href={path}
        prefetch={false}
        className={`w-auto flex gap-2 rounded-full xl:p-3 p-2 hover:ring hover:ring-neutral-100 dark:hover:ring-0 hover:dark:bg-neutral-800 transition-all ${className}`}
      >
        <Icon {...iconProps} />

        <div>
          <p className={clsx("text-base xl:text-lg", isActive && "font-bold")}>
            {title}
          </p>
          <p className=" text-xs text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
      </Link>
    </li>
  );
};

export const SidebarContent = () => {
  const router = useRouter();
  const session = useSession();

  const user = session?.data?.user;
  const sessionStatus = session?.status;

  const callbackRoute = router.isReady && !!router.asPath ? router.asPath : "/";
  const filteredRoute = callbackRoute.split("?")[0];
  const callbackUrl = encodeURIComponent(filteredRoute);

  return (
    <div className="xl:py-6 pt-6 px-3 xl:mt-2 flex flex-col gap-3 w-full h-full overflow-y-auto relative">
      <nav>
        <ul className="flex flex-col xl:gap-3 gap-1">
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

          <ShouldRender if={sessionStatus === "authenticated"}>
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
              path={`/users/${user?.id}`}
              title="Profile"
              subtitle="Go to your profile"
            />
          </ShouldRender>
        </ul>
      </nav>

      <div className="w-full xl:mt-auto flex flex-col gap-3">
        <ShouldRender if={sessionStatus !== "loading"}>
          <Link
            passHref
            legacyBehavior
            href={
              sessionStatus === "authenticated"
                ? "/posts/new"
                : `/auth/signin?callbackUrl=${callbackUrl}`
            }
          >
            <ButtonLink
              variant="primary"
              size="lg"
              className="rounded-full flex justify-center shadow-md font-bold w-full transition-opacity"
            >
              {sessionStatus === "authenticated" ? "Create post" : "Sign in"}
            </ButtonLink>
          </Link>
        </ShouldRender>

        <ThemeButton />

        <div className="w-full flex flex-col items-center">
          <ShouldRender if={session.status === "loading"}>
            <BeatLoader className="dark:fill-white fill-neutral-900" />
          </ShouldRender>

          <ShouldRender if={sessionStatus === "authenticated"}>
            <div className="flex gap-2 w-full py-2">
              <Image
                src={user?.image || "/static/default-profile.jpg"}
                width={48}
                height={48}
                className="rounded-full xl:w-11 xl:h-11 w-10 h-10"
                alt="Your profile picture"
              />

              <div>
                <Link
                  href={`/users/${user?.id}`}
                  className="text-ellipsis line-clamp-1 -mb-1 hover:underline break-words xl:text-base text-sm max-w-[85%]"
                >
                  {getUserDisplayName(user)}
                </Link>
                <Link
                  href={`/auth/signout?callbackUrl=${callbackUrl}`}
                  className="text-sm text-neutral-600 dark:text-neutral-500 hover:underline"
                >
                  Sign out
                </Link>
              </div>
            </div>
          </ShouldRender>
          <p className="text-xs dark:text-neutral-600 text-neutral-500 text-center mt-2">
            {packageJson.version} ·{" "}
            <a
              className="underline"
              href="https://github.com/leojuriolli7/t3-blog"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  return (
    <aside className="fixed xl:block hidden left-0 w-[250px] h-screen bg-white border-zinc-300 border-x dark:border-neutral-800 dark:bg-neutral-900">
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
