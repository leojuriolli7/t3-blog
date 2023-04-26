import { useState } from "react";
import { useTabs } from "@hooks/useTabs";

const useFilterContent = () => {
  const [contentFilters] = useState({
    tabs: [
      {
        label: "Most recent",
        id: "newest",
      },
      {
        label: "Oldest",
        id: "oldest",
      },
      {
        label: "Most interactions",
        id: "liked",
      },
    ],
    initialTabId: "newest",
  });

  const tabs = useTabs(contentFilters);
  const { selectedTab, tabProps } = tabs;

  return { selectedTab, tabProps };
};

export default useFilterContent;
