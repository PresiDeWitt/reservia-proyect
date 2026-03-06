import { api } from './client';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  distance: string;
  rating: number;
  priceRange: string;
  address: string;
  image: string;
  reviewsCount: number;
  coords: [number, number];
  description?: string;
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
  total: number;
}

export const restaurantsApi = {
  list: (params?: { search?: string; cuisine?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.cuisine) qs.set('cuisine', params.cuisine);
    const query = qs.toString() ? `?${qs}` : '';
    return api.get<RestaurantsResponse>(`/restaurants/${query}`);
  },

  get: (id: string) => api.get<Restaurant>(`/restaurants/${id}/`),

  cuisines: () => api.get<string[]>('/restaurants/cuisines/'),
};
