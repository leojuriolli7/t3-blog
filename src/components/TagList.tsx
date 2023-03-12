import { Tag as TagType } from "@prisma/client";
import Link from "next/link";
import React from "react";
import Tag from "./Tag";

type Props = {
  tags?: TagType[];
  loading: boolean;
  compact?: boolean;
};

const TagList: React.FC<Props> = ({ tags, loading, compact = false }) => {
  const loadingArray = Array.from<undefined>({ length: 3 });

  const loadingClasses = `${
    loading
      ? `w-16 ${compact ? "h-7" : "h-9"} opacity-60 pointer-events-none`
      : ""
  }`;

  const paddings = `${compact ? "px-2 py-1" : "p-2"}`;

  return (
    <div className={`flex flex-wrap gap-2 mt-2`}>
      {(loading ? loadingArray : tags)?.map((tag, i) => (
        <Link key={loading ? i : tag?.id} href={`/posts/tags/${tag?.id}`}>
          <Tag
            title={`Click to see all ${tag?.name} posts`}
            role="link"
            className={`border-none hover:opacity-80 cursor-pointer select-none ${paddings} ${loadingClasses}`}
          >
            {tag?.name}
          </Tag>
        </Link>
      ))}
    </div>
  );
};

export default TagList;
