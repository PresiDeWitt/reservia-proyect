import { api } from './client';

export interface ReservationSeat {
  id: number;
  label: string;
  tableLabel: string;
}

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
  status: 'confirmed' | 'cancelled';
  created_at: string;
  seats?: ReservationSeat[];
}

export const reservationsApi = {
  create: (data: { restaurantId: number; date: string; time: string; guests: number; seatIds?: number[] }) =>
    api.post<Reservation>('/reservations/', data),

  myReservations: () => api.get<Reservation[]>('/reservations/my/'),

  cancel: (id: number) => api.delete<{ message: string }>(`/reservations/${id}/`),
};
