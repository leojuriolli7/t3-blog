import { useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MdAddBox, MdLogin } from "react-icons/md";
import { FaAppleAlt, FaUser } from "react-icons/fa";
import ShouldRender from "./ShouldRender";
import ThemeSwitch from "./ThemeSwitch";
import { useRouter } from "next/router";
import Image from "next/image";
import Popover from "./Popover";
import { AiFillHeart } from "react-icons/ai";

const Header: React.FC = () => {
  const session = useSession();
  const router = useRouter();

  const callbackRoute = router.isReady && !!router.asPath ? router.asPath : "/";
  const filteredRoute = callbackRoute.split("?")[0];
  const callbackUrl = encodeURIComponent(filteredRoute);

  const handleSignout = useCallback(
    () => router.push(`/auth/signout?callbackUrl=${callbackUrl}`),
    [callbackUrl, router]
  );
  const handleProfile = useCallback(
    () => router.push(`/users/${session?.data?.user?.id}`),
    [session, router]
  );
  const handleFavorites = useCallback(
    () => router.push(`/users/${session?.data?.user?.id}/favorites`),
    [session, router]
  );

  return (
    <header className="w-full relative flex justify-center items-center">
      <nav className="absolute left-0 flex items-center sm:gap-5 gap-3">
        <ShouldRender if={session.status === "authenticated"}>
          <Popover.Main
            icon={
              <Image
                src={
                  session?.data?.user?.image || "/static/default-profile.jpg"
                }
                width={36}
                height={36}
                alt="Your profile picture"
                className="rounded-full cursor-pointer"
              />
            }
          >
            <Popover.Item
              icon={<FaUser size={14} className="text-emerald-500 mt-1" />}
              title="Your profile"
              gap="2"
              subtitle="Go to your profile"
              onClick={handleProfile}
            />
            <Popover.Item
              title="Favorite posts"
              subtitle="Your favorited posts"
              gap="1"
              icon={<AiFillHeart size={16} className="text-emerald-500" />}
              onClick={handleFavorites}
            />
            <Popover.Item title="Logout" onClick={handleSignout} />
          </Popover.Main>

          <Link href="/posts/new" legacyBehavior>
            <a className="block underline hover:opacity-80">Create post</a>
          </Link>
        </ShouldRender>

        <ShouldRender if={session.status === "unauthenticated"}>
          <Link href={`/auth/signin?callbackUrl=${callbackUrl}`} legacyBehavior>
            <a className="block underline">Login</a>
          </Link>
          <Link href={`/auth/signin?callbackUrl=${callbackUrl}`} legacyBehavior>
            <a className="block underline">Register</a>
          </Link>
        </ShouldRender>
        <Link href="/posts/search" legacyBehavior>
          <a className="block underline hover:opacity-80">Search</a>
        </Link>
        <Link href="/" legacyBehavior>
          <a className="sm:hidden block underline hover:opacity-80">Home</a>
        </Link>
      </nav>
      <Link href="/">
        <FaAppleAlt
          aria-label="Go back to home"
          title="Go to the homepage"
          role="link"
          size={40}
          className="dark:text-emerald-500 text-emerald-700 cursor-pointer sm:block hidden hover:opacity-75"
        />
      </Link>

      <div className="absolute right-0">
        <ThemeSwitch />
      </div>
    </header>
  );
};

export default Header;
