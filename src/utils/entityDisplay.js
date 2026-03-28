export const getEntityDisplayName = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'string') return entity.trim();

  const firstName = entity.first_name || entity.firstName || '';
  const lastName = entity.last_name || entity.lastName || '';
  const combinedName = `${firstName} ${lastName}`.trim();

  return String(
    entity.full_name ||
      entity.fullName ||
      entity.display_name ||
      entity.displayName ||
      entity.name ||
      entity.username ||
      combinedName ||
      entity.email ||
      ''
  ).trim();
};

export const normalizeNamedEntity = (entity = {}) => ({
  ...entity,
  name: getEntityDisplayName(entity),
});

export const matchesSearch = (value, query) =>
  String(value || '')
    .toLowerCase()
    .includes(String(query || '').trim().toLowerCase());
