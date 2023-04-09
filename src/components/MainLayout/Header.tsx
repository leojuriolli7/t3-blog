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

  return (
    <header className="w-full relative flex h-10 justify-between items-center">
      <Link
        href={`/users/${session?.data?.user?.id}`}
        className="flex items-center gap-2 group"
        title="Go to your profile"
      >
        <ShouldRender if={!!session.status && session.status !== "loading"}>
          <Image
            src={session?.data?.user?.image || "/static/default-profile.jpg"}
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
            {session?.data?.user?.name}
          </p>
          <p className="text-neutral-600 dark:text-neutral-500 text-sm italic">
            {session?.data?.user?.email}
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
