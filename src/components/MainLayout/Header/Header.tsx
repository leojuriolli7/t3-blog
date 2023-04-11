import ShouldRender from "@components/ShouldRender";
import SlideOver from "@components/SlideOver";
import { useRouter } from "next/router";
import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import Image from "next/future/image";
import Link from "next/link";
import SearchDropdown from "./SearchDropdown";
import { SidebarContent } from "../Sidebar/Sidebar";

const Header: React.FC = () => {
  const router = useRouter();

  const openAsideState = useState(false);
  const [, setOpen] = openAsideState;

  return (
    <header className="w-full relative flex h-10 gap-2 items-center">
      <Link href="/" className="xl:block hidden">
        <Image src="/static/logo.png" width={60} height={60} alt="T3 logo" />
      </Link>

      <button className="xl:hidden block" onClick={() => setOpen(true)}>
        <GiHamburgerMenu className="h-8 w-8 text-gray-500 dark:text-gray-400" />
      </button>
      <SlideOver openState={openAsideState}>
        <SidebarContent />
      </SlideOver>

      <div className="absolute right-0 z-[100]">
        <ShouldRender if={!router.pathname.includes("/search")}>
          <SearchDropdown />
        </ShouldRender>
      </div>
    </header>
  );
};

export default Header;
