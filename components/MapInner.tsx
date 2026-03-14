"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Search, Star, Zap, X } from "lucide-react";
import { mockListings } from "@/lib/mockData";
import Image from "next/image";

// Fix for default Leaflet icon paths in next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

const getIcon = (type: string, evCharging: boolean) => {
    let html = "";

    if (type === "tool") {
        html =
            '<div class="w-8 h-8 bg-orange-500 rounded-full border-[3px] border-white shadow-md flex items-center justify-center"></div>';
    } else {
        if (evCharging) {
            html =
                '<div class="w-8 h-8 bg-blue-500 rounded-full border-[3px] border-white shadow-md flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>';
        } else {
            html =
                '<div class="w-8 h-8 bg-emerald-500 rounded-full border-[3px] border-white shadow-md flex items-center justify-center"></div>';
        }
    }

    return L.divIcon({
        html,
        className: "bg-transparent", // clear default divIcon styles
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

function MapController({
    center,
}: {
    center: [number, number] | null;
}) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { animate: true });
        }
    }, [center, map]);
    return null;
}

export default function MapInner({ listingType }: { listingType: "space" | "tool" }) {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [selectedListing, setSelectedListing] = useState<any | null>(null);
    const mapRef = useRef<any>(null);

    // Filter listings based on what we're exploring
    const filteredListings = mockListings.filter((l) => l.type === listingType);

    const handleRecenter = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(loc);
                    // MapController handles the map re-center via map.flyTo
                },
                (error) => {
                    console.error("Error obtaining location", error);
                    // Provide a stable fallback (e.g. London) if user denies geolocation
                    setUserLocation([51.505, -0.09]);
                }
            );
        } else {
            setUserLocation([51.505, -0.09]);
        }
    };

    // On mount, get user's location
    useEffect(() => {
        handleRecenter();
    }, []);

    // Map click handler component
    function MapEvents() {
        useMapEvents({
            click: () => setSelectedListing(null),
        });
        return null;
    }

    const defaultCenter: [number, number] = [51.505, -0.09];
    const initialCenter = userLocation || defaultCenter;

    return (
        <div className="relative w-full h-[100dvh]">
            {/* Search Bar Overflow */}
            <div className="absolute top-4 left-4 right-4 z-[400]">
                <div className="bg-white rounded-full shadow-lg border border-gray-100 px-4 py-3 flex items-center">
                    <Search className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder={`Search for a ${listingType}...`}
                        className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Recenter FAB */}
            <button
                onClick={handleRecenter}
                className="absolute right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[400] bg-white text-gray-700 p-3 rounded-full shadow-lg border border-gray-100 active:scale-95 transition-transform"
            >
                <LocateFixed className="w-6 h-6" />
            </button>

            {/* The Map itself */}
            <MapContainer
                center={initialCenter}
                zoom={14}
                zoomControl={false} // hide default zoom controls for mobile feel
                style={{ width: "100%", height: "100%" }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <MapController center={userLocation} />
                <MapEvents />

                {filteredListings.map((listing) => (
                    <Marker
                        key={listing.id}
                        position={[listing.lat, listing.lng]}
                        icon={getIcon(listing.type, listing.evCharging)}
                        eventHandlers={{
                            click: () => {
                                setSelectedListing(listing);
                            },
                        }}
                    />
                ))}

                {/* Optional: Add a subtle marker for the user's location */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={L.divIcon({
                            html: '<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(37,99,235,0.3)]"></div>',
                            className: "bg-transparent",
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                        })}
                    />
                )}
            </MapContainer>

            {/* Bottom Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl shadow-[0_-4px_25px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out ${
                    selectedListing ? "translate-y-0" : "translate-y-full"
                }`}
            >
                {selectedListing && (
                    <div className="p-5 pb-[calc(5rem+env(safe-area-inset-bottom))] relative">
                        {/* Close button pill / drag handle simulated */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
                        
                        <button
                            onClick={() => setSelectedListing(null)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full active:scale-95"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={selectedListing.image}
                                    alt={selectedListing.title}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate">
                                    {selectedListing.title}
                                </h3>
                                
                                {selectedListing.evCharging && (
                                    <div className="inline-flex items-center mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                        <Zap className="w-3 h-3 mr-1" fill="currentColor" />
                                        EV Charging Available
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                    <span>{selectedListing.ownerName}</span>
                                    <span className="text-gray-300">•</span>
                                    <div className="flex items-center text-amber-500">
                                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                        <span className="font-medium text-gray-700">{selectedListing.trustScore}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <div>
                                <span className="text-2xl font-bold text-gray-900">
                                    £{selectedListing.pricePerHour.toFixed(2)}
                                </span>
                                <span className="text-gray-500 text-sm"> / hr</span>
                            </div>
                            <button className="bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-emerald-900/20 active:scale-95 transition-transform">
                                Pre-book
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
