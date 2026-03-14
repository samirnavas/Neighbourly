import dynamic from "next/dynamic";
import type { Listing } from "@/types";

// Dummy listings data for map display (as specified in the requirements)
const DUMMY_LISTINGS: Listing[] = [
  {
    id: "1",
    owner_id: "user-1",
    title: "Wide Driveway — City Centre",
    description: "Spacious double driveway, available evenings and weekends.",
    category: "space",
    price_per_day: 8,
    latitude: 40.7128,
    longitude: -74.006,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    owner_id: "user-2",
    title: "Covered Garage Spot",
    description: "Secure, covered single garage. Perfect for overnight parking.",
    category: "space",
    price_per_day: 12,
    latitude: 40.7158,
    longitude: -74.009,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    owner_id: "user-3",
    title: "Bosch Power Drill Set",
    description: "Professional-grade drill with a full set of bits. Like new.",
    category: "tool",
    price_per_day: 15,
    latitude: 40.7095,
    longitude: -74.001,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    owner_id: "user-4",
    title: "Electric Lawnmower",
    description: "Quiet, battery-powered lawnmower. Great for small gardens.",
    category: "tool",
    price_per_day: 20,
    latitude: 40.7145,
    longitude: -73.998,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    owner_id: "user-5",
    title: "Quiet Street Parking",
    description: "Kerb-side spot on a quiet residential road.",
    category: "space",
    price_per_day: 5,
    latitude: 40.7108,
    longitude: -74.013,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    owner_id: "user-6",
    title: "Pressure Washer",
    description: "2200 PSI pressure washer. Includes all attachments.",
    category: "tool",
    price_per_day: 25,
    latitude: 40.7175,
    longitude: -74.003,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Dynamically import the Map component — must be client-side only (no SSR)
const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🗺️</div>
        <p className="text-gray-500 text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

export default function ExplorePage() {
  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-bold text-lg text-gray-900">Explore Listings</h1>
          <p className="text-sm text-gray-500">
            Click a pin to see details and book
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Parking Space</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Tool</span>
          </div>
        </div>
      </div>

      {/* Full-screen Map */}
      <div className="flex-1 relative">
        <MapComponent listings={DUMMY_LISTINGS} />
      </div>
    </div>
  );
}
