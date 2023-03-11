import { useKeenSlider } from "keen-slider/react";
import React from "react";

type Props = {
  children: React.ReactNode;
  onFinish?: () => void;
};

const Carousel: React.FC<Props> = ({ children, onFinish }) => {
  const [sliderRef] = useKeenSlider({
    mode: "free",
    slides: {
      perView: "auto",
      spacing: 15,
    },
    ...(onFinish && {
      slideChanged: (instance) => {
        const isNearFinish = instance.track.details.progress > 0.6;

        if (isNearFinish) {
          onFinish();
        }
      },
    }),
  });

  return (
    <div ref={sliderRef} className="keen-slider">
      {children}
    </div>
  );
};

export default Carousel;
