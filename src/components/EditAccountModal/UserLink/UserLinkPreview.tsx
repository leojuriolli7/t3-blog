import ShouldRender from "@components/ShouldRender";
import { urlSchema } from "@schema/user.schema";
import { useEffect, useRef, useState } from "react";
import { infer as zodInfer } from "zod";

type PreviewProps = {
  data: zodInfer<typeof urlSchema>;
};

const UserLinkPreview: React.FC<PreviewProps> = ({ data }) => {
  const [hovering, setHovering] = useState(false);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const widthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!!data) setMaxWidth(widthRef?.current?.clientWidth);
  }, [data]);

  return (
    <ShouldRender if={!!data}>
      <a href={data?.url} target="_blank" rel="noreferrer">
        <div
          ref={widthRef}
          style={{
            maxWidth,
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="flex w-full gap-2 items-center h-[40px] mt-2 ring-1 dark:ring-0 ring-inset ring-gray-300 bg-white hover:bg-gray-100 dark:hover:bg-zinc-600 dark:bg-zinc-700 p-2 cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data?.icon} alt={data?.title} width="16px" height="16px" />

          <p className="text-sm line-clamp-1 text-ellipsis break-all overflow-hidden">
            {hovering ? data?.url : data?.title}
          </p>
        </div>
      </a>
    </ShouldRender>
  );
};

export default UserLinkPreview;
