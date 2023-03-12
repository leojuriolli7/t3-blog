import { useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaAppleAlt, FaUser, FaUserFriends } from "react-icons/fa";
import { BiUserPlus } from "react-icons/bi";
import ShouldRender from "./ShouldRender";
import ThemeSwitch from "./ThemeSwitch";
import { useRouter } from "next/router";
import Image from "next/image";
import Popover from "./Popover";
import { AiFillHeart, AiFillTag } from "react-icons/ai";
import { HiMenu, HiSearch } from "react-icons/hi";
import { MdAdd } from "react-icons/md";

const Header: React.FC = () => {
  const session = useSession();
  const router = useRouter();

  const callbackRoute = router.isReady && !!router.asPath ? router.asPath : "/";
  const filteredRoute = callbackRoute.split("?")[0];
  const callbackUrl = encodeURIComponent(filteredRoute);

  const redirect = useCallback(
    (route: string) => () => router.push(route),
    [router]
  );

  return (
    <header className="w-full relative flex h-10 justify-center items-center">
      <nav className="absolute left-0 flex items-center gap-3">
        <Popover.Main
          icon={
            <Image
              src={session?.data?.user?.image || "/static/default-profile.jpg"}
              width={36}
              height={36}
              alt="Your profile picture"
              className="rounded-full cursor-pointer"
            />
          }
        >
          <ShouldRender if={session?.status === "authenticated"}>
            <Popover.Item
              icon={<FaUser size={14} className="text-emerald-500 mt-1" />}
              title="Your profile"
              gap="2"
              subtitle="Go to your profile"
              onClick={redirect(`/users/${session?.data?.user?.id}`)}
            />
            <Popover.Item
              title="Favorite posts"
              subtitle="Your favorited posts"
              gap="1"
              icon={<AiFillHeart size={16} className="text-emerald-500" />}
              onClick={redirect(`/users/${session?.data?.user?.id}/favorites`)}
            />
            <Popover.Item
              icon={
                <FaUserFriends size={14} className="text-emerald-500 mt-1" />
              }
              title="Following"
              gap="2"
              subtitle="Posts from your following"
              onClick={redirect("/posts/following")}
            />
            <Popover.Item
              title="Logout"
              onClick={redirect(`/auth/signout?callbackUrl=${callbackUrl}`)}
            />
          </ShouldRender>

          <ShouldRender if={session?.status === "unauthenticated"}>
            <Popover.Item
              icon={<BiUserPlus size={20} className="text-emerald-500" />}
              title="Sign in"
              gap="1"
              subtitle="Login or create your account"
              onClick={redirect(`/auth/signin?callbackUrl=${callbackUrl}`)}
            />
          </ShouldRender>
        </Popover.Main>

        <Popover.Main
          icon={
            <HiMenu
              size={27}
              className="dark:text-emerald-500 text-emerald-700 block sm:hidden"
            />
          }
        >
          <ShouldRender if={session?.status === "authenticated"}>
            <Popover.Item
              icon={<MdAdd size={14} className="text-emerald-500 mt-1" />}
              title="Create post"
              subtitle="Create your own post"
              gap="2"
              onClick={redirect("/posts/new")}
            />
          </ShouldRender>
          <Popover.Item
            title="All tags"
            subtitle="Browse through all tags"
            gap="1"
            icon={<AiFillTag size={16} className="text-emerald-500" />}
            onClick={redirect("/posts/tags")}
          />
          <Popover.Item
            icon={<HiSearch size={14} className="text-emerald-500 mt-1" />}
            title="Search"
            gap="2"
            subtitle="Search posts"
            onClick={redirect("/posts/search")}
          />
        </Popover.Main>

        <ShouldRender if={session?.status === "authenticated"}>
          <Link href="/posts/new" legacyBehavior>
            <a className="sm:block hidden underline hover:opacity-80">
              Create post
            </a>
          </Link>
        </ShouldRender>

        <Link href="/posts/tags" legacyBehavior>
          <a className="sm:block hidden underline hover:opacity-80">All tags</a>
        </Link>
        <Link href="/posts/search" legacyBehavior>
          <a className="sm:block hidden underline hover:opacity-80">Search</a>
        </Link>
        <Link href="/" legacyBehavior>
          <a className="sm:block hidden underline hover:opacity-80 ">Home</a>
        </Link>
      </nav>
      <FaAppleAlt
        aria-label="Go back to home"
        title="Go to the homepage"
        role="link"
        onClick={redirect("/")}
        size={40}
        className="dark:text-emerald-500 text-emerald-700 cursor-pointer block sm:hidden hover:opacity-75"
      />

      <div className="absolute right-0">
        <ThemeSwitch />
      </div>
    </header>
  );
};

export default Header;
