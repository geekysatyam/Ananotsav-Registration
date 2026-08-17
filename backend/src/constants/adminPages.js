/** Admin panel page keys — used for RBAC and nav. */
export const ADMIN_PAGES = [
  'scanner',
  'register',
  'registrations',
  'volunteers',
  'abhishek',
  'fancy-dress',
  'laddu-gopal',
  'leaderboard',
  'admins',
];

export const DESK_PAGES = ['scanner', 'register'];

export const ALL_PAGES = [...ADMIN_PAGES];

export const ADMIN_ROLES = ['super_admin', 'admin', 'desk'];

/** Resolve effective page list for a role. */
export function pagesForRole(role, pages = []) {
  if (role === 'super_admin') return [...ALL_PAGES];
  if (role === 'desk') return [...DESK_PAGES];
  const allowed = new Set(ADMIN_PAGES.filter((p) => p !== 'admins'));
  return (pages ?? []).filter((p) => allowed.has(p));
}

export function hasPageAccess(role, pages, page) {
  return pagesForRole(role, pages).includes(page);
}
