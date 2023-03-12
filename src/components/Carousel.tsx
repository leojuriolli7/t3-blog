import React from "react";
import { KeenSliderPlugin, useKeenSlider } from "keen-slider/react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import ShouldRender from "./ShouldRender";

type Props = {
  children: React.ReactNode;
  onFinish?: () => void;
};

type ArrowProps = {
  onClick: () => void;
  prev?: boolean;
};

// Plugin for watching resize changes and adapting the slider
const ResizePlugin: KeenSliderPlugin = (slider) => {
  const observer = new ResizeObserver(function () {
    slider.update();
  });

  slider.on("created", () => {
    observer.observe(slider.container);
  });
  slider.on("destroyed", () => {
    observer.unobserve(slider.container);
  });
};

// Plugin for watching new elements added to the slider
const MutationPlugin: KeenSliderPlugin = (slider) => {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      slider.update();
    });
  });
  const config = { childList: true };

  slider.on("created", () => {
    observer.observe(slider.container, config);
  });
  slider.on("destroyed", () => {
    observer.disconnect();
  });
};

const arrowIconProps = {
  className:
    "text-neutral-800 dark:text-white flex-shrink-0 sm:w-[30px] sm:h-[30px] h-[20px] w-[20px]",
};

const Arrow: React.FC<ArrowProps> = ({ onClick, prev }) => {
  return (
    <button
      className={`absolute top-0 ${
        prev ? "sm:-left-7 -left-5" : "sm:-right-7 -right-5"
      } h-full w-5 flex justify-center items-center`}
      onClick={onClick}
    >
      <ShouldRender if={prev}>
        <MdKeyboardArrowLeft {...arrowIconProps} />
      </ShouldRender>

      <ShouldRender if={!prev}>
        <MdKeyboardArrowRight {...arrowIconProps} />
      </ShouldRender>
    </button>
  );
};

const Carousel: React.FC<Props> = ({ children, onFinish }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      initial: 0,
      mode: "free",
      slides: {
        perView: "auto",
        spacing: 15,
      },
      slideChanged: (instance) => {
        setCurrentSlide(instance.track.details.abs);
      },
    },
    [MutationPlugin, ResizePlugin]
  );

  const isLastSlide =
    instanceRef?.current &&
    currentSlide === instanceRef.current.track?.details?.maxIdx;

  const isFirstSlide = currentSlide === 0;

  return (
    <div className="relative">
      <div ref={sliderRef} className="keen-slider">
        {children}
      </div>

      <ShouldRender if={!isFirstSlide}>
        <Arrow
          prev
          onClick={() => instanceRef.current?.moveToIdx(currentSlide - 1)}
        />
      </ShouldRender>

      <ShouldRender if={!isLastSlide}>
        <Arrow
          onClick={() => instanceRef.current?.moveToIdx(currentSlide + 1)}
        />
      </ShouldRender>
    </div>
  );
};

export default Carousel;
