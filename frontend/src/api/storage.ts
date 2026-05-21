export const STORAGE_KEYS = {
  TOKEN: 'reservia_token',
  REFRESH: 'reservia_refresh',
  USER: 'reservia_user',
  STAFF_TOKEN: 'reservia_staff_token',
  STAFF_ROLE: 'reservia_staff_role',
  THEME: 'reservia_theme',
  ROLES: 'reservia_roles',
  OWNER_PROFILES: 'reservia_owner_profiles',
} as const;

export const storage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
  getJSON: <T>(key: string): T | null => {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined') return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  setJSON: (key: string, value: unknown) =>
    localStorage.setItem(key, JSON.stringify(value)),
};
