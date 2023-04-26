import { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";

export type FilterTypes = "newest" | "oldest" | "liked";
const filters: FilterTypes[] = ["newest", "oldest", "liked"];

const useFilterPosts = () => {
  const { t } = useTranslation("common");

  const [currentFilter, setCurrentFilter] = useState<FilterTypes>("newest");

  const filterLabels: Record<FilterTypes, string> = {
    liked: t("filters.most-interactions"),
    oldest: t("filters.oldest"),
    newest: t("filters.most-recent"),
  };

  const toggleFilter = useCallback(
    (value: FilterTypes) => () => setCurrentFilter(value),
    []
  );

  return { filters, filterLabels, currentFilter, toggleFilter };
};

export default useFilterPosts;
