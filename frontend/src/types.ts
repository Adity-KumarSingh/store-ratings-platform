export type Role = 'admin' | 'user' | 'owner';

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: Role;
  rating?: number | null;
  created_at?: string;
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  ownerId: number | null;
  overallRating: number;
  ratingCount: number;
  userRating: number | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface OwnerStore {
  id: number;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  ratingCount: number;
  raters: {
    userId: number;
    name: string;
    email: string;
    address: string;
    rating: number;
    ratedAt: string;
  }[];
}
