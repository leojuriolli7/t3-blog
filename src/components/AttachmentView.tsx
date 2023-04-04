import { InitializePlugin } from "@utils/plugins";
import { useKeenSlider } from "keen-slider/react";
import React from "react";
import clsx from "clsx";
import { MediaType } from "./AttachmentPreview";
import { saveAs } from "file-saver";
import {
  MdDownload,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import ShouldRender from "./ShouldRender";
import Image from "next/image";
import { isAttachmentType } from "@utils/isAttachmentType";

type Props = {
  medias?: MediaType[];
};

type SlideProps = {
  children: React.ReactNode;
  label?: string;
};

type ArrowProps = {
  onClick: () => void;
  prev?: boolean;
};

const arrowIconProps = {
  className: "text-white dark:text-emerald-500 flex-shrink-0",
  size: 32,
};

const Arrow: React.FC<ArrowProps> = ({ onClick, prev }) => {
  return (
    <button
      aria-label={prev ? "Carousel back button" : "Carousel next button"}
      className={clsx(
        prev ? "-left-7" : "-right-7",
        "absolute z-20 top-1/2 transform -translate-y-1/2 rounded-full p-1 justify-center items-center bg-emerald-500 shadow-lg dark:bg-teal-900 hover:bg-emerald-400 hover:dark:bg-teal-700 transition-colors sm:flex hidden"
      )}
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

const Slide: React.FC<SlideProps> = ({ children, label }) => {
  return (
    <div className="w-full keen-slider__slide flex flex-col justify-center">
      {children}

      <p className="mt-2 text-sm prose dark:prose-invert">{label}</p>
    </div>
  );
};

const AttachmentView: React.FC<Props> = ({ medias }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [currentFile, setCurrentFile] = React.useState<MediaType | undefined>(
    medias?.[0]
  );

  const handleClickDownload = () => {
    if (currentFile?.url) {
      saveAs(currentFile.url, currentFile.name);
    }
  };

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      initial: 0,
      mode: "snap",
      disabled: medias?.length === 1,
      slides: {
        perView: 1,
        spacing: 15,
      },
      slideChanged: (instance) => {
        const newIndex = instance.track.details.abs;
        setCurrentSlide(newIndex);
        setCurrentFile(medias?.[newIndex]);
      },
    },
    [InitializePlugin]
  );

  const isLastSlide =
    instanceRef?.current &&
    currentSlide === instanceRef.current.track?.details?.maxIdx;

  const isFirstSlide = currentSlide === 0;

  return (
    <div className="relative w-full ring-1 ring-neutral-300 dark:ring-0 bg-white dark:bg-neutral-900 h-auto p-4">
      <MdDownload
        onClick={handleClickDownload}
        size={30}
        role="button"
        title="Download file"
        aria-label="Download file"
        className="absolute top-6 right-6 z-10 cursor-pointer bg-emerald-500 shadow-lg dark:bg-teal-900 hover:bg-emerald-400 hover:dark:bg-teal-700 p-1 text-white dark:text-emerald-500 transition-colors"
      />

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

      <div className="keen-slider" ref={sliderRef}>
        {medias?.map((file) => (
          <Slide
            key={file.name}
            // TO-DO: get from media object.
            label="file description"
          >
            <ShouldRender if={isAttachmentType("image", file.type)}>
              {/*TO-DO: Images with a max-height and object-fit not cover. */}
              <Image
                // hack for next/image to be 100%.
                width={0}
                height={0}
                sizes="100vw"
                src={file.url as string}
                alt={file.name}
                className="h-full w-auto object-cover"
                // disable lazy-loading
                priority
              />
            </ShouldRender>

            <ShouldRender if={isAttachmentType("video", file.type)}>
              <video src={file.url as string} controls />
            </ShouldRender>
          </Slide>
        ))}
      </div>
    </div>
  );
};

export default AttachmentView;
