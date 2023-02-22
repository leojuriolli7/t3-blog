import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { RiMoonClearFill, RiSunFill } from "react-icons/ri";
import ShouldRender from "./ShouldRender";

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

  return (
    <ShouldRender if={mounted}>
      <button onClick={toggleTheme} type="button">
        <ShouldRender if={isDarkMode}>
          <RiMoonClearFill className="text-emerald-500" size={27} />
        </ShouldRender>

        <ShouldRender if={!isDarkMode}>
          <RiSunFill className="text-emerald-700" size={27} />
        </ShouldRender>
      </button>
    </ShouldRender>
  );
};

export default ThemeSwitch;
