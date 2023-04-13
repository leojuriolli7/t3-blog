import ShouldRender from "@components/ShouldRender";
import SlideOver from "@components/SlideOver";
import { useRouter } from "next/router";
import stickybits from "stickybits";
import { useEffect, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import Image from "next/future/image";
import Link from "next/link";
import SearchDropdown from "./SearchDropdown";
import { SidebarContent } from "../Sidebar/Sidebar";

const HeaderContent: React.FC = () => {
  const router = useRouter();

  const openAsideState = useState(false);
  const [, setOpen] = openAsideState;

  useEffect(() => {
    /**
     * I am having to use a position sticky polyfill because headless UI dialogs are
     * causing flickering on position: sticky elements.
     * https://github.com/tailwindlabs/headlessui/discussions/2305
     *
     * TO-DO: Use `position: sticky` when headless ui issue is fixed.
     */
    stickybits(".sticky-header", { useFixed: true, noStyles: true });
  }, []);

  return (
    <>
      <Link href="/" className="xl:block hidden">
        <Image src="/static/logo.png" width={60} height={60} alt="T3 logo" />
      </Link>

      <button className="xl:hidden block" onClick={() => setOpen(true)}>
        <GiHamburgerMenu className="h-8 w-8 text-gray-500 dark:text-gray-400" />
      </button>
      <SlideOver openState={openAsideState}>
        <SidebarContent />
      </SlideOver>

      <div className="absolute xl:right-0 right-3 z-[100]">
        <ShouldRender if={!router.pathname.includes("/search")}>
          <SearchDropdown />
        </ShouldRender>
      </div>
    </>
  );
};

/**
 * Because of the issue with Headless UI, I had to separate the header into 2 (mobile & desktop),
 * and use stickybits, when it is fixed, I should be able to reduce it with xl:sticky.
 */
const Header: React.FC = () => {
  return (
    <header className="w-full">
      <div className="xl:flex hidden w-full relative h-10 px-0 bg-transparent gap-2 items-center">
        <HeaderContent />
      </div>

      <div
        className="xl:hidden flex w-[inherit] h-16 px-3 sticky-header left-1/2 transform -translate-x-1/2
 top-0 z-[100] bg-neutral-50 dark:bg-neutral-900 gap-2 items-center"
      >
        <HeaderContent />
      </div>
    </header>
  );
};

export default Header;
