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
};
