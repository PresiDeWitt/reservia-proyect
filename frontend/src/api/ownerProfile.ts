export interface OwnerProfile {
  name: string;
  cuisine: string;
  address: string;
  capacity: number;
  phone?: string;
  description?: string;
}

import { STORAGE_KEYS, storage } from './storage';

type Map = Record<string, OwnerProfile>;

const read = (): Map => storage.getJSON<Map>(STORAGE_KEYS.OWNER_PROFILES) ?? {};

export const getOwnerProfile = (email: string): OwnerProfile | null =>
  read()[email.toLowerCase()] ?? null;

export const setOwnerProfile = (email: string, profile: OwnerProfile) => {
  const map = read();
  map[email.toLowerCase()] = profile;
  storage.setJSON(STORAGE_KEYS.OWNER_PROFILES, map);
};
