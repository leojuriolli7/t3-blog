import { Tag as TagType } from "@prisma/client";
import { Tag } from "antd";
import React from "react";

type Props = {
  tags?: TagType[];
  loading: boolean;
  compact?: boolean;
};

const TagList: React.FC<Props> = ({ tags, loading, compact = false }) => {
  const loadingArray = Array.from<undefined>({ length: 3 });

  return (
    <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-2"} mt-2`}>
      {(loading ? loadingArray : tags)?.map((tag, i) => (
        <Tag
          className={`rounded-none border-none text-white text-sm bg-emerald-500 dark:bg-teal-900 ${
            compact ? "px-2 py-1" : "p-2"
          } hover:opacity-80 cursor-pointer select-none ${
            loading ? "w-16 h-9 opacity-60" : ""
          }`}
          key={loading ? i : tag?.id}
        >
          {tag?.name}
        </Tag>
      ))}
    </div>
  );
};

export default TagList;
