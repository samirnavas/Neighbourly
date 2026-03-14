export type ListingCategory = "space" | "tool";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: ListingCategory;
  price_per_day: number;
  latitude: number;
  longitude: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: Profile;
}

export interface Booking {
  id: string;
  listing_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  listings?: Listing;
}

export interface NewListingData {
  title: string;
  description: string;
  category: ListingCategory;
  price_per_day: number;
  latitude: number;
  longitude: number;
}

export interface NewBookingData {
  listing_id: string;
  start_date: string;
  end_date: string;
}
