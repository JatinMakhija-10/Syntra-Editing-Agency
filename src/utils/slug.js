/**
 * Utility functions for generating and matching URL slugs for services
 */

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const findServiceBySlug = (mergedData, slug) => {
  if (!slug || !mergedData) return null;
  const cleanSlug = slug
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  for (const category of Object.keys(mergedData)) {
    const services = mergedData[category] || {};
    for (const title of Object.keys(services)) {
      const currentSlug = slugify(title);
      // Exact match or partial match for convenience
      if (
        currentSlug === cleanSlug ||
        currentSlug.startsWith(cleanSlug) ||
        cleanSlug.startsWith(currentSlug)
      ) {
        return { category, service: services[title] };
      }
    }
  }
  return null;
};
