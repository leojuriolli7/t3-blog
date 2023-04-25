import { useCallback, useEffect, useState } from "react";
import { RiMoonClearFill, RiSunFill } from "react-icons/ri";
import { Transition } from "@headlessui/react";
import Button from "@components/Button";
import ShouldRender from "@components/ShouldRender";
import { useTheme } from "next-themes";
import clsx from "clsx";

const iconProps = {
  size: 20,
  className: "text-white",
};

const icons = [
  <RiSunFill key={1} {...iconProps} />,
  <RiMoonClearFill key={2} {...iconProps} />,
];

const transitionConfig = {
  enter: "transform transition ease-in-out duration-200 delay-150",
  enterFrom: "translate-y-full opacity-0",
  enterTo: "translate-y-0 opacity-100",
  leave: "transform transition ease-in-out duration-200",
  leaveFrom: "translate-y-0 opacity-100",
  leaveTo: "translate-y-full opacity-0",
};

const ThemeButton = () => {
  const [mounted, setMounted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const onHover = (value: boolean) => () => setHovering(value);

  const { theme, systemTheme, setTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = currentTheme === "dark";

  const toggleTheme = useCallback(
    () => setTheme(currentTheme === "dark" ? "light" : "dark"),
    [setTheme, currentTheme]
  );

  const bgClasses = clsx(
    isDarkMode
      ? "from-blue-800 from-50% via-yellow-500 via-10% to-orange-400"
      : "from-orange-400 from-50% via-sky-500 via-10% to-blue-800"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ShouldRender if={mounted}>
      <Button
        onMouseEnter={onHover(true)}
        onMouseLeave={onHover(false)}
        onClick={toggleTheme}
        size="lg"
        variant="transparent"
        className={`flex w-full justify-center rounded-full bg-gradient-to-br shadow-md ${bgClasses} bg-size-200 bg-pos-0 text-white transition-all duration-500 hover:bg-pos-100 hover:opacity-100`}
      >
        <div className="flex w-full items-center justify-center gap-2 overflow-hidden">
          <div className="h-[20px] w-[20px]">
            <Transition {...transitionConfig} show={hovering}>
              {icons[isDarkMode ? 0 : 1]}
            </Transition>

            <Transition {...transitionConfig} show={!hovering}>
              {icons[isDarkMode ? 1 : 0]}
            </Transition>
          </div>
          Change theme
        </div>
      </Button>
    </ShouldRender>
  );
};

export default ThemeButton;
