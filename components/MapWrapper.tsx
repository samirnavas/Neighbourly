"use client";

import dynamic from "next/dynamic";
import type { Listing } from "@/types";

// Leaflet must only be rendered client-side (no SSR)
const Map = dynamic(() => import("@/components/Map"), {
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

interface MapWrapperProps {
  listings: Listing[];
  center?: [number, number];
  zoom?: number;
  onListingClick?: (listing: Listing) => void;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <Map {...props} />;
}
