import React from "react";
import Button from "./Button";
import Carousel from "./Carousel";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";

type Props = {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
  onClickSeeMore?: () => void;
};

const Section: React.FC<Props> = ({
  children,
  title,
  loading,
  onClickSeeMore,
}) => {
  return (
    <div className="bg-slate-100 dark:bg-zinc-800 shadow-md w-full sm:px-10 px-5 py-5">
      <div className="w-full flex justify-between">
        <div>
          <ShouldRender if={!loading}>
            <h2 className="prose break-all dark:prose-invert sm:text-2xl text-xl font-bold text-ellipsis line-clamp-1">
              {title}
            </h2>
          </ShouldRender>

          <ShouldRender if={loading}>
            <Skeleton heading lines={1} width="w-3/5" />
          </ShouldRender>
        </div>

        <ShouldRender if={onClickSeeMore}>
          <Button
            disabled={loading}
            variant="gradient"
            size="sm"
            onClick={onClickSeeMore}
          >
            See more
          </Button>
        </ShouldRender>
      </div>

      <div className="mt-3">
        <Carousel>{children}</Carousel>
      </div>
    </div>
  );
};

export default Section;
