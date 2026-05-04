import { api } from './client';

export interface StaffResponse {
  token: string;
  refresh: string;
  role: 'owner' | 'admin';
}

export const staffApi = {
  login: (code: string) => api.post<StaffResponse>('/auth/staff/', { code }),
};
