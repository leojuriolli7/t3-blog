import Link from "next/link";
import { useSession } from "next-auth/react";
import { MdLogout, MdAddBox, MdLogin } from "react-icons/md";
import { FaAppleAlt, FaUserCircle } from "react-icons/fa";
import ShouldRender from "./ShouldRender";
import ThemeSwitch from "./ThemeSwitch";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const session = useSession();
  const router = useRouter();

  const callbackRoute = router.isReady && !!router.asPath ? router.asPath : "/";
  const filteredRoute = callbackRoute.split("?")[0];
  const callbackUrl = encodeURIComponent(filteredRoute);

  return (
    <header className="w-full relative flex justify-center items-center">
      <nav className="absolute left-0 flex sm:gap-5 gap-3">
        <ShouldRender if={session.status === "authenticated"}>
          <Link href={`/users/${session.data?.user.id}`} legacyBehavior>
            <a className="hidden sm:block">Profile</a>
          </Link>

          <Link href="/posts/new" legacyBehavior>
            <a className="hidden sm:block">Create post</a>
          </Link>
          <Link
            href={`/auth/signout?callbackUrl=${callbackUrl}`}
            legacyBehavior
          >
            <a className="hidden sm:block">Logout</a>
          </Link>

          <Link href={`/users/${session.data?.user.id}`}>
            <FaUserCircle
              size={25}
              className="sm:hidden block dark:text-emerald-500 text-emerald-700"
              aria-label="Go to your profile"
              role="link"
            />
          </Link>

          <Link href="/posts/new">
            <MdAddBox
              size={25}
              className="sm:hidden block dark:text-emerald-500 text-emerald-700"
              role="link"
            />
          </Link>
          <Link href={`/auth/signout?callbackUrl=${callbackUrl}`}>
            <MdLogout
              size={25}
              className="sm:hidden block dark:text-emerald-500 text-emerald-700"
              aria-label="Logout"
              role="link"
            />
          </Link>
        </ShouldRender>
        <ShouldRender if={session.status === "unauthenticated"}>
          <Link href={`/auth/signin?callbackUrl=${callbackUrl}`} legacyBehavior>
            <a className="hidden sm:block">Login</a>
          </Link>
          <Link href={`/auth/signin?callbackUrl=${callbackUrl}`} legacyBehavior>
            <a className="hidden sm:block">Register</a>
          </Link>

          <Link href={`/auth/signin?callbackUrl=${callbackUrl}`}>
            <MdLogin
              size={25}
              className="sm:hidden block dark:text-emerald-500 text-emerald-700"
              role="link"
            />
          </Link>
        </ShouldRender>
      </nav>
      <Link href="/">
        <FaAppleAlt
          aria-label="Go back to home"
          title="Go to the homepage"
          role="link"
          size={40}
          className="dark:text-emerald-500 text-emerald-700 cursor-pointer hover:opacity-75"
        />
      </Link>

      <div className="absolute right-0">
        <ThemeSwitch />
      </div>
    </header>
  );
};

export default Header;
