import { KeenSliderPlugin } from "keen-slider/react";

// Fix keen-slider initial layout shift.
export const InitializePlugin: KeenSliderPlugin = (slider) => {
  slider.on("created", () => {
    slider?.container?.classList?.add("initialized");
  });
};
