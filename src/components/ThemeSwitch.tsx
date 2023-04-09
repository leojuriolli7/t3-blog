import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { RiMoonClearFill, RiSunFill } from "react-icons/ri";
import ShouldRender from "./ShouldRender";
import Popover from "./Popover";

const ThemeSwitch: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme, setTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = currentTheme === "dark";

  const toggleTheme = useCallback(
    () => setTheme(currentTheme === "dark" ? "light" : "dark"),
    [setTheme, currentTheme]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const Icon = isDarkMode ? RiMoonClearFill : RiSunFill;

  return (
    <ShouldRender if={mounted}>
      <Popover.Item
        icon={<Icon size={14} className="text-emerald-500 mt-1" />}
        title="Change theme"
        subtitle={`Turn ${isDarkMode ? "on" : "off"} the lights`}
        gap="1"
        onClick={toggleTheme}
      />
    </ShouldRender>
  );
};

export default ThemeSwitch;
