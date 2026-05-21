import type { UserRole } from './auth';
import { STORAGE_KEYS, storage } from './storage';

type RoleMap = Record<string, UserRole>;

const read = (): RoleMap => storage.getJSON<RoleMap>(STORAGE_KEYS.ROLES) ?? {};

export const setRole = (email: string, role: UserRole) => {
  const map = read();
  map[email.toLowerCase()] = role;
  storage.setJSON(STORAGE_KEYS.ROLES, map);
};

// Hardcoded admin emails — sólo estas cuentas obtienen rol admin al loguear.
// Cambia esta lista por tus emails privados.
const ADMIN_EMAILS = new Set<string>([
  'admin@reservia.com',
]);

export const getRole = (email: string): UserRole => {
  const e = email.toLowerCase();
  if (ADMIN_EMAILS.has(e)) return 'admin';
  return read()[e] ?? 'customer';
};
