import { useState, useEffect } from "react";

const getWindowWidth = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
};

type Dimensions = {
  width?: number;
  height?: number;
};

export default function useGetWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState<Dimensions>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowWidth());
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
