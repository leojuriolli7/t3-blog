import { useEffect, useState } from "react";

const useOnScreen = (
  ref: React.RefObject<HTMLDivElement>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { threshold: 1, ...(options || {}) }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current]);

  return isIntersecting;
};

export default useOnScreen;
