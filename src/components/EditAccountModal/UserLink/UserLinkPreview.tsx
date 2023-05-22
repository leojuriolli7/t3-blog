import ShouldRender from "@components/ShouldRender";
import { urlSchema } from "@schema/user.schema";
import { useState } from "react";
import { infer as zodInfer } from "zod";

type PreviewProps = {
  data: zodInfer<typeof urlSchema>;
};

const UserLinkPreview: React.FC<PreviewProps> = ({ data }) => {
  const [hovering, setHovering] = useState(false);

  return (
    <ShouldRender if={!!data}>
      <a href={data?.url} target="_blank" rel="noreferrer">
        <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="mt-2 flex h-[40px] w-full cursor-pointer items-center gap-2 rounded-md bg-white p-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 dark:bg-zinc-700 dark:ring-0 dark:hover:bg-zinc-600"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data?.icon} alt={data?.title} width="16px" height="16px" />

          <p className="word-break-word line-clamp-1 overflow-hidden text-ellipsis text-sm">
            {hovering ? data?.url : data?.title}
          </p>
        </div>
      </a>
    </ShouldRender>
  );
};

export default UserLinkPreview;
