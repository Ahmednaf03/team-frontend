export const buildPaginationCacheKey = (filters = {}) => {
  const normalizedFilters = Object.keys(filters)
    .sort()
    .reduce((acc, key) => {
      const value = filters[key];

      if (value === '' || value === null || value === undefined) {
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});

  return JSON.stringify(normalizedFilters);
};
