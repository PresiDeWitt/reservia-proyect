export interface OwnerProfile {
  name: string;
  cuisine: string;
  address: string;
  capacity: number;
  phone?: string;
  description?: string;
}

const KEY = 'reservia_owner_profiles';

type Map = Record<string, OwnerProfile>;

const read = (): Map => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};

export const getOwnerProfile = (email: string): OwnerProfile | null =>
  read()[email.toLowerCase()] ?? null;

export const setOwnerProfile = (email: string, profile: OwnerProfile) => {
  const map = read();
  map[email.toLowerCase()] = profile;
  localStorage.setItem(KEY, JSON.stringify(map));
};
