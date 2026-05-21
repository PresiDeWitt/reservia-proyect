import { api } from './client';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  distance_km: number;
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
  items: Restaurant[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AvailabilitySlot {
  time: string;
  service: 'lunch' | 'dinner';
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  guests: number;
  slots: AvailabilitySlot[];
}

export interface TableData {
  id: number;
  label: string;
  zone: 'main' | 'terrace' | 'private';
  capacity: number;
  supplement: number;
  posX: number;
  posY: number;
  rotation: number;
  available: boolean;
}

export interface TablesResponse {
  tables: TableData[];
}

export interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  can_review: boolean;
  has_reviewed: boolean;
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

  availability: (id: string, date: string, guests: number) =>
    api.get<AvailabilityResponse>(`/restaurants/${id}/availability/?date=${date}&guests=${guests}`),

  tables: (id: string, date?: string, time?: string) => {
    const qs = new URLSearchParams();
    if (date) qs.set('date', date);
    if (time) qs.set('time', time);
    const query = qs.toString() ? `?${qs}` : '';
    return api.get<TablesResponse>(`/restaurants/${id}/tables/${query}`);
  },

  reviews: (id: string) => api.get<ReviewsResponse>(`/restaurants/${id}/reviews/`),

  createReview: (id: string, rating: number, comment: string) =>
    api.post<Review>(`/restaurants/${id}/reviews/`, { rating, comment }),

  favorites: () => api.get<{ favorites: Restaurant[] }>('/favorites/'),
  addFavorite: (restaurantId: number) => api.post<{ status: string }>('/favorites/add/', { restaurantId }),
  removeFavorite: (restaurantId: number) => api.delete<{ status: string }>(`/favorites/${restaurantId}/remove/`),
};
