const filters: Record<string, object> = {
  newest: {
    createdAt: "desc",
  },
  oldest: {
    createdAt: "asc",
  },
  liked: {
    likes: {
      _count: "desc",
    },
  },
};

export const getFiltersByInput = (filter?: string) => {
  if (typeof filter === "string") {
    return filters[filter];
  }
};
