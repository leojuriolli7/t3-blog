export const getFiltersByInput = (filter?: string, isComments?: boolean) => {
  const filters: Record<string, object> = {
    newest: {
      createdAt: "desc",
    },
    oldest: {
      createdAt: "asc",
    },
    ...(isComments
      ? {
          children: {
            _count: "desc",
          },
        }
      : {
          liked: {
            likes: {
              _count: "desc",
            },
          },
        }),
  };

  if (typeof filter === "string") {
    return filters[filter];
  }
};
