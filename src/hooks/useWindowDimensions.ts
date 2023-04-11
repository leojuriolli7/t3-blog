import { useState, useEffect } from "react";

const getWindowHeight = () => {
  const { innerHeight: height } = window;
  return height;
};

export default function useGetWindowHeight() {
  const [windowDimensions, setWindowDimensions] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowHeight());
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
