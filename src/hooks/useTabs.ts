import { useState } from "react";

export type TabType = { label: string; id: string };

/**
 * This hook helps interact with the `AnimatedTabs` component,
 * generating all its necessary props and returning the current active tab.
 */
export function useTabs({
  tabs,
  initialTabId,
  onChange,
}: {
  tabs: TabType[];
  initialTabId: string;
  onChange?: (id: string) => void;
}) {
  const [selectedTabIndex, setSelectedTab] = useState(() => {
    const indexOfInitialTab = tabs.findIndex((tab) => tab.id === initialTabId);
    return indexOfInitialTab === -1 ? 0 : indexOfInitialTab;
  });

  return {
    tabProps: {
      tabs,
      selectedTabIndex,
      onChange,
      setSelectedTab,
    },
    selectedTab: tabs[selectedTabIndex],
  };
}
