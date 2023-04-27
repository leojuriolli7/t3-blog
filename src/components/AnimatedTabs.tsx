import { TabType } from "@hooks/useTabs";
import clsx from "clsx";
import {
  PointerEvent,
  FocusEvent,
  useEffect,
  useRef,
  useState,
  CSSProperties,
  useCallback,
} from "react";
import useGetWindowDimensions from "@hooks/useGetWindowDimensions";

type Props = {
  selectedTabIndex: number;
  tabs: TabType[];
  setSelectedTab: (input: number) => void;
  large?: boolean;
};

const AnimatedTabs = ({
  tabs,
  selectedTabIndex,
  setSelectedTab,
  large,
}: Props): JSX.Element => {
  const { width: windowWidth } = useGetWindowDimensions();

  const [buttonRefs, setButtonRefs] = useState<Array<HTMLButtonElement | null>>(
    []
  );

  useEffect(() => {
    setButtonRefs((prev) => prev.slice(0, tabs.length));
  }, [tabs.length]);

  const [hoveredTabIndex, setHoveredTabIndex] = useState<number | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

  const navRef = useRef<HTMLDivElement>(null);
  const navRect = navRef.current?.getBoundingClientRect();

  const selectedRect = buttonRefs[selectedTabIndex]?.getBoundingClientRect();

  const [isInitialHoveredElement, setIsInitialHoveredElement] = useState(true);
  const isInitialRender = useRef(true);

  const onLeaveTabs = () => {
    setIsInitialHoveredElement(true);
    setHoveredTabIndex(null);
  };

  const onEnterTab = (
    e: PointerEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
    i: number
  ) => {
    if (!e.target || !(e.target instanceof HTMLButtonElement)) return;

    setHoveredTabIndex((prev) => {
      if (prev != null && prev !== i) {
        setIsInitialHoveredElement(false);
      }

      return i;
    });
    setHoveredRect(e.target.getBoundingClientRect());
  };

  const onSelectTab = (i: number) => {
    setSelectedTab(i);
  };

  let hoverStyles: CSSProperties = { opacity: 0 };
  let selectStyles: CSSProperties = { opacity: 0 };

  const toggleStyles = useCallback(() => {
    if (navRect && hoveredRect) {
      hoverStyles.transform = `translate3d(${
        hoveredRect.left - navRect.left
      }px,${hoveredRect.top - navRect.top}px,0px)`;
      hoverStyles.width = hoveredRect.width;
      hoverStyles.height = hoveredRect.height;
      hoverStyles.opacity = hoveredTabIndex != null ? 1 : 0;
      hoverStyles.transition = isInitialHoveredElement
        ? `opacity 150ms`
        : `transform 150ms 0ms, opacity 150ms 0ms, width 150ms`;
    }

    if (navRect && selectedRect) {
      selectStyles.width = selectedRect.width * 0.8;
      selectStyles.transform = `translateX(calc(${
        selectedRect.left - navRect.left
      }px + 10%))`;
      selectStyles.opacity = 1;
      selectStyles.transition = isInitialRender.current
        ? `opacity 150ms 150ms`
        : `transform 150ms 0ms, opacity 150ms 150ms, width 150ms`;

      isInitialRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hoverStyles,
    hoveredRect,
    hoveredTabIndex,
    isInitialHoveredElement,
    navRect,
    selectStyles,
    selectedRect,
    // By adding window dimensions here, we recalculate the positions on window resize.
    windowWidth,
  ]);

  toggleStyles();

  return (
    <nav
      ref={navRef}
      className="relative z-0 flex w-full flex-shrink-0 items-center justify-center overflow-hidden py-2"
      onPointerLeave={onLeaveTabs}
    >
      {tabs.map((item, i) => {
        return (
          <button
            key={i}
            className={clsx(
              "prose relative z-20 flex h-6 cursor-pointer select-none items-center rounded-md bg-transparent px-4 transition-colors dark:prose-invert",
              hoveredTabIndex === i && "text-neutral-600 dark:text-gray-300",
              large
                ? "px-6 py-6 text-xl font-bold sm:text-2xl"
                : "px-4 text-base -2sm:px-2 -2sm:text-sm"
            )}
            aria-label={`Select ${item.label}`}
            ref={(el) => (buttonRefs[i] = el)}
            onPointerEnter={(e) => onEnterTab(e, i)}
            onFocus={(e) => onEnterTab(e, i)}
            onClick={() => onSelectTab(i)}
          >
            {item.label}
          </button>
        );
      })}
      <div
        className="absolute left-0 top-0 z-10 rounded-md bg-gray-200 transition-[width] dark:bg-neutral-700"
        style={hoverStyles}
      />
      <div
        className={clsx(
          "absolute bottom-0 left-0 z-10 bg-gray-700 dark:bg-gray-300",
          large ? "h-1 rounded-md" : "h-0.5"
        )}
        style={selectStyles}
      />
    </nav>
  );
};

export default AnimatedTabs;
