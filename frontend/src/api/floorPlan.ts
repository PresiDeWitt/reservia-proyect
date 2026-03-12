import { api } from './client';

export interface SeatData {
  id: number;
  seat_index: number;
  label: string;
}

export interface TableData {
  id: number;
  label: string;
  shape: 'round' | 'square' | 'rectangular';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  capacity: number;
  min_capacity: number;
  seats: SeatData[];
}

export interface FloorPlanData {
  id: number;
  width: number;
  height: number;
  background_color: string;
  updated_at: string;
  tables: TableData[];
}

export interface FloorPlanResponse {
  hasFloorPlan: boolean;
  floorPlan?: FloorPlanData;
}

export interface SeatAvailability {
  id: number;
  seatIndex: number;
  label: string;
  tableId: number;
  isOccupied: boolean;
}

export interface AvailabilityResponse {
  seats: SeatAvailability[];
}

export const floorPlanApi = {
  get: (restaurantId: string) =>
    api.get<FloorPlanResponse>(`/restaurants/${restaurantId}/floor-plan/`),

  getAvailability: (restaurantId: string, date: string, time: string) =>
    api.get<AvailabilityResponse>(
      `/restaurants/${restaurantId}/availability/?date=${date}&time=${time}`
    ),

  save: (restaurantId: string, data: {
    width: number;
    height: number;
    backgroundColor: string;
    tables: Omit<TableData, 'id' | 'seats'>[];
  }) =>
    api.put<FloorPlanData>(`/restaurants/${restaurantId}/floor-plan/edit/`, data),
};
