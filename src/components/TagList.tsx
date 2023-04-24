import { Tag as TagType } from "@prisma/client";
import Link from "next/link";
import React from "react";
import Tag from "./Tag";

type Props = {
  tags?: TagType[];
  loading: boolean;
  compact?: boolean;
  full?: boolean;
};

const TagList: React.FC<Props> = ({
  tags,
  loading,
  compact = false,
  full = false,
}) => {
  const loadingArray = Array.from<undefined>({ length: 3 });

  const loadingClasses = `${
    loading ? `w-16 ${compact ? "h-7" : "h-9"} opacity-60` : ""
  }`;

  const paddings = `${compact ? "px-2 py-1" : "p-2"}`;

  return (
    <div className={`mt-2 flex flex-wrap gap-2 ${full ? "w-full" : ""}`}>
      {(loading ? loadingArray : tags)?.map((tag, i) => (
        <Link
          key={loading ? i : tag?.id}
          href={`/posts/tags/${tag?.id}`}
          prefetch={false}
          className={loading ? "cursor-disabled pointer-events-none" : ""}
        >
          <Tag
            title={`Click to see all ${tag?.name} posts`}
            role="link"
            className={`cursor-pointer select-none border-none hover:opacity-80 ${paddings} ${loadingClasses}`}
          >
            {tag?.name}
          </Tag>
        </Link>
      ))}
    </div>
  );
};

export default TagList;
