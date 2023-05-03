import { TagType } from "@utils/types";
import Image from "@components/Image";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";
import clsx from "clsx";
import Link from "next/link";

type Props = {
  loading: boolean;
  tag?: TagType;
};

const TagPreview: React.FC<Props> = ({ tag, loading }) => {
  return (
    <Link href={`/users/${tag?.id}`} className="w-full">
      <div
        className={clsx(
          loading ? "pointer-events-none" : "",
          "flex w-full gap-2 rounded-lg border-2 border-zinc-300 bg-white p-6 shadow-md hover:opacity-80 dark:border-neutral-700 dark:bg-zinc-800/70"
        )}
      >
        <Image
          src={tag?.avatar}
          isLoading={loading}
          width={48}
          height={48}
          alt={tag?.name || "Tag"}
          className="h-12 w-12 flex-shrink-0 rounded-full"
        />
        <div className="w-full">
          <ShouldRender if={loading}>
            <Skeleton lines={1} width="w-full mb-3" />
            <Skeleton lines={2} width="w-full" />
          </ShouldRender>
          <ShouldRender if={!loading}>
            <h2 className="prose line-clamp-1 text-ellipsis text-lg font-bold dark:prose-invert">
              {tag?.name}
            </h2>

            <p className="prose line-clamp-2 text-ellipsis leading-6 dark:prose-invert">
              {tag?.description}
            </p>
          </ShouldRender>
        </div>
      </div>
    </Link>
  );
};

export default TagPreview;
