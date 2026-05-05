import type { UserRole } from './auth';

const KEY = 'reservia_roles';

type RoleMap = Record<string, UserRole>;

const read = (): RoleMap => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};

export const setRole = (email: string, role: UserRole) => {
  const map = read();
  map[email.toLowerCase()] = role;
  localStorage.setItem(KEY, JSON.stringify(map));
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
