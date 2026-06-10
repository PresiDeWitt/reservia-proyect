import { ownerApi } from './owner';

export interface OwnerProfile {
  name: string;
  cuisine: string;
  address: string;
  capacity: number;
  phone?: string;
  description?: string;
}

export const getOwnerProfile = async (_email: string): Promise<OwnerProfile | null> => {
  try {
    const res = await ownerApi.getProfile();
    return {
      name: res.name,
      cuisine: res.cuisine,
      address: res.address,
      capacity: res.capacity ?? 0,
      phone: res.phone,
      description: res.description,
    };
  } catch {
    return null;
  }
};

export const setOwnerProfile = async (_email: string, profile: OwnerProfile): Promise<void> => {
  await ownerApi.updateProfile({
    name: profile.name,
    cuisine: profile.cuisine,
    address: profile.address,
    description: profile.description || '',
    capacity: profile.capacity,
    phone: profile.phone || '',
  });
};
