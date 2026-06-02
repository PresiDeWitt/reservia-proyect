import { staffApi } from './client';

export interface AdminStats {
  totalRestaurants: number;
  totalUsers: number;
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  cancellationRate: number;
  totalGuests: number;
  estimatedRevenue: number;
}

export interface TopRestaurant {
  id: number;
  name: string;
  location: string;
  rating: number;
  totalReservations: number;
  confirmedReservations: number;
  estimatedRevenue: number;
}

export interface CityData {
  name: string;
  restaurants: number;
  avgRating: number;
  totalReservations: number;
  pct: number;
}

export interface ImpersonateResponse {
  token: string;
  refresh: string;
  role: 'owner';
}

export const adminApi = {
  stats: () => staffApi.get<AdminStats>('/admin/stats/'),
  topRestaurants: () =>
    staffApi.get<{ restaurants: TopRestaurant[] }>('/admin/top-restaurants/'),
  cityDistribution: () =>
    staffApi.get<{ cities: CityData[] }>('/admin/city-distribution/'),
  impersonate: (restaurantId: number) =>
    staffApi.post<ImpersonateResponse>('/admin/impersonate/', { restaurant_id: restaurantId }),
};
