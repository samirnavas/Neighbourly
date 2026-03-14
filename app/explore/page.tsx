"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import MapWrapper from "@/components/MapWrapper";
import type { Listing } from "@/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

function ExploreContent() {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get("category") || "all";

  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredListings = useMemo(() => {
    return DUMMY_LISTINGS.filter((listing) => {
      // Category filter
      if (activeCategory !== "all" && listing.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        return (
          listing.title.toLowerCase().includes(query) ||
          (listing.description && listing.description.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Search Engine and Filters Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6 flex-shrink-0 shadow-sm z-10 relative">
        <div className="flex flex-col w-full md:w-auto">
          <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight">Explore the Map</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Find specific tools and exact spots seamlessly</p>
        </div>

        {/* Search Engine Input */}
        <div className="relative w-full md:flex-1 md:max-w-md lg:max-w-xl mx-auto flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="Search for 'Power drill' or 'Driveway'..."
            className="pl-12 py-6 text-base w-full rounded-2xl border-gray-200 focus-visible:ring-emerald-500 hover:border-emerald-300 shadow-sm transition-all duration-300 bg-gray-50/50 hover:bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills & Legend */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${activeCategory === 'all' ? 'bg-gray-900 text-white shadow-md scale-105' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('space')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-sm ${activeCategory === 'space' ? 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg scale-105' : 'bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50'}`}
          >
            <div className={`w-3 h-3 rounded-full ${activeCategory === 'space' ? 'bg-white' : 'bg-emerald-500'}`} />
            Spaces
          </button>
          <button
            onClick={() => setActiveCategory('tool')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-sm ${activeCategory === 'tool' ? 'bg-blue-500 text-white shadow-blue-500/30 shadow-lg scale-105' : 'bg-white border border-blue-100 text-blue-700 hover:bg-blue-50'}`}
          >
            <div className={`w-3 h-3 rounded-full ${activeCategory === 'tool' ? 'bg-white' : 'bg-blue-500'}`} />
            Tools
          </button>
        </div>
      </div>

      {/* Full-screen Map */}
      <div className="flex-1 relative bg-gray-100">
        <MapWrapper listings={filteredListings} />
        {filteredListings.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-xl border border-white px-8 py-6 rounded-3xl shadow-2xl z-[400] text-center pointer-events-none transition-all duration-500 scale-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-inner">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-extrabold text-xl text-gray-800 mb-2 mt-4">No exact matches found</p>
            <p className="text-gray-500">Try adjusting your search terms or remove filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-gray-50 animate-pulse text-xl text-emerald-600 font-bold">Initializing Map Engine...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
