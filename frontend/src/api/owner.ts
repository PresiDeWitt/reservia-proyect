import { staffApi } from './client';

export type OwnerReservationStatus = 'confirmed' | 'arrived' | 'cancelled' | 'no_show';
export type OwnerAttendanceStatus = 'confirmed' | 'arrived' | 'no_show';

export interface OwnerStats {
  restaurantName: string;
  restaurantCuisine: string;
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  totalGuests: number;
  avgGuests: number;
  cancellationRate: number;
  hourDistribution: { hour: number; count: number }[];
}

export interface OwnerReservation {
  id: number;
  name: string;
  guests: number;
  date: string;
  time: string;
  status: OwnerReservationStatus;
  table: string;
  note: string;
  occasion: string;
}

export interface OwnerReservationsResponse {
  reservations: OwnerReservation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const ownerApi = {
  stats: () => staffApi.get<OwnerStats>('/owner/stats/'),
  reservations: (params?: { status?: string; search?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString() ? `?${qs}` : '';
    return staffApi.get<OwnerReservationsResponse>(`/owner/reservations/${query}`);
  },
  updateStatus: (id: number, status: OwnerAttendanceStatus) =>
    staffApi.patch<{ id: number; status: OwnerReservationStatus }>(`/owner/reservations/${id}/status/`, { status }),

  // ── Profile ──────────────────────────────────────────────────────────────
  getProfile: () => staffApi.get<OwnerRestaurantProfile>('/owner/profile/'),
  updateProfile: (data: Partial<OwnerRestaurantProfile>) =>
    staffApi.patch<{ message: string; id: number }>('/owner/profile/', data),

  // ── Menu items ───────────────────────────────────────────────────────────
  getMenuItems: () => staffApi.get<OwnerMenuItem[]>('/owner/menu-items/'),
  createMenuItem: (data: { name: string; description?: string; price: number }) =>
    staffApi.post<OwnerMenuItem>('/owner/menu-items/', data),
  updateMenuItem: (id: number, data: Partial<OwnerMenuItem>) =>
    staffApi.patch<OwnerMenuItem>(`/owner/menu-items/${id}/`, data),
  deleteMenuItem: (id: number) =>
    staffApi.delete(`/owner/menu-items/${id}/`),

  // ── Tables ───────────────────────────────────────────────────────────────
  getTables: () => staffApi.get<OwnerTableData[]>('/owner/tables/'),
  createTable: (data: Partial<OwnerTableData>) =>
    staffApi.post<OwnerTableData>('/owner/tables/', data),
  updateTable: (id: number, data: Partial<OwnerTableData>) =>
    staffApi.patch<OwnerTableData>(`/owner/tables/${id}/`, data),
  deleteTable: (id: number) =>
    staffApi.delete(`/owner/tables/${id}/`),
};

export interface OwnerRestaurantProfile {
  id: number;
  name: string;
  cuisine: string;
  address: string;
  description: string;
  location: string;
  price_range: string;
  image_url: string;
  lat: number;
  lng: number;
  phone: string;
}

export interface OwnerMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface OwnerTableData {
  id: number;
  label: string;
  zone: string;
  capacity: number;
  supplement: number;
  pos_x: number;
  pos_y: number;
  rotation: number;
  is_active: boolean;
}
