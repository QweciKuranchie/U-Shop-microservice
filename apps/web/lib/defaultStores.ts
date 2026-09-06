export interface DefaultStore {
  _id: string;
  name: string;
  slug: { current: string };
  ownerName: string;
  description: string;
  rating: number;
  verifiedStudent: boolean;
  verifiedSeller: boolean;
  productCount: number;
  logo?: string;
  banner?: string;
  location?: {
    name: string;
    city: string;
    slug?: { current: string };
  };
}

export const DEFAULT_STORES: DefaultStore[] = [];
