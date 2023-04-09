import ShouldRender from "../ShouldRender";
import { useRouter } from "next/router";
import SearchDropdown from "../SearchDropdown";
import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import SlideOver from "@components/SlideOver";
import { SidebarContent } from "./Sidebar/Sidebar";

const Header: React.FC = () => {
  const router = useRouter();

  const openAsideState = useState(false);
  const [, setOpen] = openAsideState;

  return (
    <header className="w-full relative flex h-10 justify-between items-center">
      <GiHamburgerMenu
        className="xl:hidden block h-8 w-8 text-gray-500 dark:text-gray-400"
        onClick={() => setOpen(true)}
        role="button"
      />
      <SlideOver openState={openAsideState}>
        <SidebarContent />
      </SlideOver>

      <div className="absolute right-0">
        <ShouldRender if={!router.pathname.includes("/search")}>
          <SearchDropdown />
        </ShouldRender>
      </div>
    </header>
  );
};

export default Header;
