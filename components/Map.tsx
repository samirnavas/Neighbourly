"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Listing } from "@/types";

interface MapProps {
  listings: Listing[];
  center?: [number, number];
  zoom?: number;
  onListingClick?: (listing: Listing) => void;
}

// Default center: New York City
const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];
const DEFAULT_ZOOM = 13;

export default function Map({
  listings,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  onListingClick,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!).setView(center, zoom);
      mapInstanceRef.current = map;

      // OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add markers for each listing
      listings.forEach((listing) => {
        const isSpace = listing.category === "space";

        // Custom icon color based on category
        const iconHtml = `
          <div style="
            background-color: ${isSpace ? "#10b981" : "#3b82f6"};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 14px;">
              ${isSpace ? "🅿️" : "🔧"}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([listing.latitude, listing.longitude], {
          icon: customIcon,
        }).addTo(map);

        const popupContent = `
          <div style="min-width: 180px; font-family: sans-serif;">
            <div style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 600;
              background-color: ${isSpace ? "#d1fae5" : "#dbeafe"};
              color: ${isSpace ? "#065f46" : "#1e40af"};
              margin-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">
              ${isSpace ? "🅿️ Parking Space" : "🔧 Tool"}
            </div>
            <h3 style="margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #111;">${listing.title}</h3>
            ${listing.description ? `<p style="margin: 0 0 8px; font-size: 13px; color: #555;">${listing.description}</p>` : ""}
            <p style="margin: 0; font-size: 15px; font-weight: 700; color: #059669;">$${listing.price_per_day}/day</p>
            <a href="/listings/${listing.id}" style="
              display: block;
              margin-top: 10px;
              padding: 6px 12px;
              background: #10b981;
              color: white;
              text-align: center;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              text-decoration: none;
            ">View & Book</a>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onListingClick) {
          marker.on("click", () => onListingClick(listing));
        }
      });
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}
