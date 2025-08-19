export function buildPageLinks(basePath, { page, limit, sort, query }, hasPrevPage, hasNextPage) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (sort) params.set('sort', sort);
  if (query) params.set('query', query);

  const prevLink = hasPrevPage ? `${basePath}?${new URLSearchParams({ ...Object.fromEntries(params), page: page - 1 })}` : null;
  const nextLink = hasNextPage ? `${basePath}?${new URLSearchParams({ ...Object.fromEntries(params), page: page + 1 })}` : null;
  return { prevLink, nextLink };
}
