import { api } from './client';

export interface Reservation {
  id: number;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantImage: string;
  restaurantCuisine: string;
  date: string;
  time: string;
  guests: number;
  occasion: string;
  note: string;
  status: 'confirmed' | 'arrived' | 'cancelled' | 'no_show';
  created_at: string;
}

export interface EditReservationData {
  date?: string;
  time?: string;
  guests?: number;
  occasion?: string;
  note?: string;
}

export const reservationsApi = {
  create: (data: { restaurantId: number; date: string; time: string; guests: number; occasion?: string; note?: string }) =>
    api.post<Reservation>('/reservations/', data),

  myReservations: () => api.get<Reservation[]>('/reservations/my/'),

  cancel: (id: number) => api.delete<{ message: string }>(`/reservations/${id}/`),

  edit: (id: number, data: EditReservationData) =>
    api.patch<Reservation>(`/reservations/${id}/edit/`, data),
};
