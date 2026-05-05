import { api } from './client';

export type UserRole = 'customer' | 'owner' | 'admin';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  refresh: string;
  user: AuthUser;
}

export const authApi = {
  register: (data: { first_name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register/', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login/', data),
};
