import ShouldRender from "../ShouldRender";
import { useRouter } from "next/router";
import SearchDropdown from "../SearchDropdown";
import { useSession } from "next-auth/react";
import Image from "next/future/image";
import Spinner from "../Spinner";
import Link from "next/link";

// TO-DO: refactor navigation and layout.
const Header: React.FC = () => {
  const session = useSession();
  const router = useRouter();

  const user = session?.data?.user;

  const callbackRoute = router.isReady && !!router.asPath ? router.asPath : "/";
  const filteredRoute = callbackRoute.split("?")[0];
  const callbackUrl = encodeURIComponent(filteredRoute);
  return (
    <header className="w-full relative flex h-10 justify-between items-center">
      <Link
        href={
          user
            ? `/users/${user?.id}`
            : `/auth/signin?callbackUrl=${callbackUrl}`
        }
        className="flex items-center gap-2 group"
        title={user ? "Go to your profile" : "Sign in"}
      >
        <ShouldRender if={!!session.status && session.status !== "loading"}>
          <Image
            src={user?.image || "/static/default-profile.jpg"}
            width={36}
            height={36}
            alt="Your profile picture"
            role="button"
            aria-label="Open profile navigation menu"
            className="rounded-full object-cover h-[36px]"
          />
        </ShouldRender>

        <div>
          <p className="dark:text-neutral-400 group-hover:underline">
            {user?.name}
          </p>
          <p className="text-neutral-600 dark:text-neutral-500 text-sm italic">
            {user?.email}
          </p>
        </div>

        <ShouldRender if={!!session.status && session.status === "loading"}>
          <Spinner />
        </ShouldRender>
      </Link>
      <ShouldRender if={!router.pathname.includes("/search")}>
        <SearchDropdown />
      </ShouldRender>
    </header>
  );
};

export default Header;
