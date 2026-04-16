import { api } from './client';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  refresh: string;
  user: AuthUser;
}

export const authApi = {
  register: (data: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
  }) => api.post<AuthResponse>('/auth/register/', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login/', data),
};
