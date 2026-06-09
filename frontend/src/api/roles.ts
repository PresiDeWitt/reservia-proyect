import type { UserRole } from './auth';

/**
 * Los roles se determinan exclusivamente desde el backend.
 * Este archivo se mantiene como utilidad de compatibilidad.
 */
export const getRole = (_email: string): UserRole => 'customer';

export const setRole = (_email: string, _role: UserRole) => {
  // No-op: los roles vienen del backend
};
