import { useCallback, useState } from "react";

export type FilterTypes = "newest" | "oldest" | "liked";

const filters: FilterTypes[] = ["newest", "oldest", "liked"];
const filterLabels: Record<FilterTypes, string> = {
  liked: "Most interactions",
  oldest: "Oldest",
  newest: "Most recent",
};

const useFilterPosts = () => {
  const [currentFilter, setCurrentFilter] = useState<FilterTypes>("newest");

  const toggleFilter = useCallback(
    (value: FilterTypes) => () => setCurrentFilter(value),
    []
  );

  return { filters, filterLabels, currentFilter, toggleFilter };
};

export default useFilterPosts;
