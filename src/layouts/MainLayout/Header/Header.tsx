import { useState } from "react";
import ShouldRender from "@components/ShouldRender";
import SlideOver from "@components/SlideOver";
import { useRouter } from "next/router";
import { GiHamburgerMenu } from "react-icons/gi";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import Image from "@components/Image";
import Link from "next/link";
import SearchDropdown from "./SearchDropdown";
import { SidebarContent } from "../Sidebar/Sidebar";

const NotificationDropdown = dynamic(
  () => import("./NotificationDropdown/NotificationDropdown"),
  {
    ssr: false,
  }
);

const TagsDropdown = dynamic(() => import("./TagsDropdown/TagsDropdown"), {
  ssr: false,
});

const Header: React.FC = () => {
  const router = useRouter();

  const { status: sessionStatus } = useSession();

  const openAsideState = useState(false);
  const [, setOpen] = openAsideState;

  return (
    <header className="relative flex h-10 w-full items-center gap-2">
      <Link href="/" className="hidden xl:block">
        <Image src="/static/logo.png" width={60} height={60} alt="T3 logo" />
      </Link>

      <button
        aria-label="Open navigation menu"
        className="block xl:hidden"
        onClick={() => setOpen(true)}
      >
        <GiHamburgerMenu className="h-8 w-8 text-gray-500 dark:text-gray-400" />
      </button>
      <SlideOver openState={openAsideState}>
        <SidebarContent />
      </SlideOver>

      <div className="absolute right-0 z-[100] flex items-center gap-3">
        <ShouldRender if={sessionStatus === "authenticated"}>
          <TagsDropdown />

          <NotificationDropdown />
        </ShouldRender>

        <ShouldRender if={!router.pathname.includes("/search")}>
          <SearchDropdown />
        </ShouldRender>
      </div>
    </header>
  );
};

export default Header;
