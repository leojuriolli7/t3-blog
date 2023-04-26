import { useState } from "react";
import { useTabs } from "@hooks/useTabs";

const useFilterContent = () => {
  const [contentFilters] = useState({
    tabs: [
      {
        label: "Most recent",
        id: "recent",
      },
      {
        label: "Oldest",
        id: "oldest",
      },
      {
        label: "Most interactions",
        id: "interactions",
      },
    ],
    initialTabId: "recent",
  });

  const tabs = useTabs(contentFilters);
  const { selectedTab, tabProps } = tabs;

  return { selectedTab, tabProps };
};

export default useFilterContent;
