import React, { useEffect, useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/router";
import useOnClickOutside from "@hooks/useClickOutside";
import dynamic from "next/dynamic";
import clsx from "clsx";
import SearchInput from "@components/SearchInput";

// Reduce initial JS load by importing the dropdown JS only when needed.
const Dropdown = dynamic(() => import("./Dropdown"), {
  ssr: false,
});

const SearchDropdown: React.FC = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [animateRef] = useAutoAnimate<HTMLDivElement>();
  const clickAwayRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const handleClickOutside = () => {
    setOpen(false);
  };
  useOnClickOutside<HTMLDivElement>(clickAwayRef, handleClickOutside);

  const onValueChange = (value: string) => {
    setOpen(!!value);
  };

  useEffect(() => {
    const handleRouteChange = (
      url: string,
      { shallow }: { shallow: boolean }
    ) => {
      if (!shallow) setOpen(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if (query) setOpen(true);
  }, [query]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div ref={clickAwayRef}>
      <div ref={animateRef} className="relative z-50">
        <div>
          <SearchInput
            setQuery={setQuery}
            onValueChange={onValueChange}
            placeholder="Search posts, comments, users & tags"
            replace={false}
            className={clsx(
              `h-[50px] pr-2 rounded-full transition-all ease xl:focus:w-96 focus:w-80 max-w-[90vw]`,
              open ? "xl:w-96 w-80" : "w-[50px]"
            )}
            full={false}
          />
        </div>
        <Dropdown query={query} open={open} />
      </div>
    </div>
  );
};

export default SearchDropdown;
