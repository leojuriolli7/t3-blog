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
import { RiRssLine, RiRssFill } from "react-icons/ri";
import { MdTag, MdOutlineTag } from "react-icons/md";
import { ButtonLink } from "@components/Button";
import BeatLoader from "@components/BeatLoader";
import { useSession } from "next-auth/react";
import ShouldRender from "@components/ShouldRender";
import { HiOutlineUsers, HiUsers } from "react-icons/hi";
import packageJson from "@package";
import Image from "@components/Image";
import getUserDisplayName from "@utils/getUserDisplayName";
import ThemeButton from "./ThemeButton";
import { GoRss } from "react-icons/go";

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
  const { pathname } = router;

  const getActive = () => {
    if (path.includes("/users/")) {
      const userId = path.split("/users/")[1];
      return router.query.userId === userId;
    }

    return pathname === path;
  };

  const isActive = getActive();

  const Icon = isActive ? activeIcon : defaultIcon;

  return (
    <li>
      <Link
        href={path}
        prefetch={false}
        className={`flex w-auto gap-2 rounded-full p-2 transition-all hover:ring hover:ring-neutral-100 hover:dark:bg-zinc-800 dark:hover:ring-0 xl:p-3 ${className}`}
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
    <div className="grey-scrollbar relative flex h-full w-full flex-col gap-3 overflow-y-auto px-3 pt-6 xl:mt-2 xl:py-6">
      <nav>
        <ul className="flex flex-col gap-1 xl:gap-3">
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
              activeIcon={MdTag}
              defaultIcon={MdOutlineTag}
              path="/posts/tags/subscribed"
              title="Subscribed"
              subtitle="Tags you subscribed to"
            />
            <Item
              activeIcon={AiFillLike}
              defaultIcon={AiOutlineLike}
              path="/posts/liked"
              title="Liked"
              subtitle="Your liked posts"
            />
            <Item
              activeIcon={RiRssFill}
              defaultIcon={GoRss}
              path="/posts/feed"
              title="Your feed"
              subtitle="Posts curated to you"
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

      <div className="flex w-full flex-col gap-3 xl:mt-auto">
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
              className="flex w-full justify-center rounded-full font-bold shadow-md transition-opacity"
            >
              {sessionStatus === "authenticated" ? "Create post" : "Sign in"}
            </ButtonLink>
          </Link>
        </ShouldRender>

        <ThemeButton />

        <div className="flex w-full flex-col items-center">
          <ShouldRender if={session.status === "loading"}>
            <BeatLoader className="fill-neutral-900 dark:fill-white" />
          </ShouldRender>

          <ShouldRender if={sessionStatus === "authenticated"}>
            <div className="flex w-full gap-2 py-2">
              <Link
                href={`/users/${user?.id}`}
                className="flex-shrink-0"
                aria-label="Go to your profile"
                aria-hidden
              >
                <Image
                  src={user?.image || "/static/default-profile.jpg"}
                  width={48}
                  height={48}
                  className="h-10 w-10 rounded-full xl:h-11 xl:w-11"
                  alt="Your profile picture"
                />
              </Link>

              <div className="w-full overflow-hidden">
                <Link
                  href={`/users/${user?.id}`}
                  aria-label="Go to your profile"
                  className="-mb-1 line-clamp-1 w-fit max-w-[95%] text-ellipsis break-words text-sm hover:underline xl:text-base"
                >
                  {getUserDisplayName(user)}
                </Link>
                <Link
                  href={`/auth/signout?callbackUrl=${callbackUrl}`}
                  className="text-sm text-neutral-600 hover:underline dark:text-neutral-500"
                >
                  Sign out
                </Link>
              </div>
            </div>
          </ShouldRender>
          <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-600">
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
    <aside className="fixed left-0 hidden h-screen w-[250px] animate-slideOver border-r border-zinc-300 bg-white dark:border-zinc-700/90 dark:bg-zinc-800/70 xl:block">
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
