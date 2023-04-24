import type { Metadata } from "@utils/types";
import { useCallback, useState } from "react";
import PreviewMediaModal from "./PreviewMediaModal";
import { IoExpandOutline } from "react-icons/io5";
import Skeleton from "./Skeleton";
import unescape from "lodash.unescape";
import ShouldRender from "./ShouldRender";
import { Link } from "@prisma/client";
type Props = {
  data?: Metadata | Link;
  loading: boolean;
  disableImagePreview?: boolean;
};

const LinkPreview: React.FC<Props> = ({
  data,
  loading,
  disableImagePreview = false,
}) => {
  const previewModalState = useState(false);
  const [, setIsOpen] = previewModalState;
  const hasImageToShow = !!data?.image;
  const shouldHaveImagePreview = hasImageToShow && !disableImagePreview;

  const openModal = useCallback(() => {
    if (shouldHaveImagePreview) {
      setIsOpen(true);
    }
  }, [shouldHaveImagePreview, setIsOpen]);

  const media = {
    name: data?.title || "Image",
    url: data?.image,
    type: "image",
  };

  return (
    <>
      <div>
        <div className="flex gap-4 w-full rounded-lg bg-white dark:bg-neutral-900 shadow-sm border-2 border-zinc-300 dark:border-neutral-700">
          <ShouldRender if={!!data && !loading}>
            <div onClick={openModal} className="relative group flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={data?.title || "Shared link"}
                src={data?.image || "/static/default.jpg"}
                className={`aspect-square rounded-l-lg ${
                  shouldHaveImagePreview
                    ? "group-hover:brightness-50 dark:group-hover:opacity-50 cursor-pointer"
                    : ""
                } sm:w-36 w-28 flex-shrink-0 object-cover`}
              />
              <ShouldRender if={shouldHaveImagePreview}>
                <IoExpandOutline
                  size={36}
                  className="text-white cursor-pointer hidden group-hover:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              </ShouldRender>
            </div>
          </ShouldRender>

          <ShouldRender if={loading}>
            <Skeleton
              width="aspect-square sm:w-36 w-28 flex-shrink-0"
              height="h-full"
            />
          </ShouldRender>
          <div className="py-3 pr-2 w-full flex flex-col justify-between">
            <ShouldRender if={!loading}>
              <div className="w-full">
                <p className="line-clamp-1 break-all font-bold">
                  {data?.title || "Shared link"}
                </p>
                <p className="sm:line-clamp-3 line-clamp-2 text-sm break-all">
                  {data?.description
                    ? unescape(data?.description)
                    : "Link shared on T3 Blog."}
                </p>
              </div>
              <a
                className="line-clamp-1 text-sm mt-1 break-all underline dark:text-emerald-500 text-emerald-700"
                target="_blank"
                rel="noreferrer"
                href={data?.url}
              >
                {data?.url}
              </a>
            </ShouldRender>

            <ShouldRender if={loading}>
              <Skeleton heading width="w-[50%]" />
              <Skeleton lines={2} width="w-full" className="mt-3" />
              <Skeleton width="w-12" className="mt-3" />
            </ShouldRender>
          </div>
        </div>
      </div>
      <ShouldRender if={!disableImagePreview}>
        <PreviewMediaModal openState={previewModalState} media={media} />
      </ShouldRender>
    </>
  );
};
export default LinkPreview;
