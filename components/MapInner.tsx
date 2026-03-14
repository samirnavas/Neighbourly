"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Search, Star, Zap, SlidersHorizontal, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { preBookListing } from "@/app/actions/bookings";
import { getDistance } from "@/lib/utils";
import RadiusFilterSheet from "./RadiusFilterSheet";
import { useLocation } from "@/components/LocationContext";

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
            map.setView(center, 13);
        }
    }, [center, map]);
    return null;
}

export type MapListing = {
    id: string;
    title: string;
    description: string | null;
    category: "space" | "tool";
    price_per_day: number | null;
    has_ev_charging: boolean;
    ev_charging_available?: boolean;
    ev_price_per_day: number | null;
    latitude: number;
    longitude: number;
    image_url: string | null;
    address_text: string | null;
    owner: {
        full_name: string | null;
        avatar_url: string | null;
        trust_score: number | null;
    };
};

export default function MapInner({
    listingType,
    initialListings
}: {
    listingType: "space" | "tool";
    initialListings: MapListing[];
}) {
    const { latitude, longitude } = useLocation();
    const [selectedListing, setSelectedListing] = useState<MapListing | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedToolCategory, setSelectedToolCategory] = useState("All");
    const [selectedRadius, setSelectedRadius] = useState<1 | 5 | 10 | 25 | null>(null);
    const [isRadiusSheetOpen, setIsRadiusSheetOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const mapRef = useRef<L.Map | null>(null);

    const toolCategories = ["All", "Power Tools", "Gardening", "Cleaning", "Automotive"];

    const userLocation: [number, number] | null = latitude && longitude ? [latitude, longitude] : null;

    const handleRecenter = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.flyTo(userLocation, 14, { animate: true });
        }
    };

    function MapEvents() {
        useMapEvents({
            click: () => setSelectedListing(null),
        });
        return null;
    }

    const defaultCenter: [number, number] = [51.505, -0.09];
    const initialCenter = userLocation || defaultCenter;

    // Filter listings
    const filteredListings = initialListings.filter((l) => {
        const matchesSearch = !!(searchTerm === "" ||
            l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.address_text && l.address_text.toLowerCase().includes(searchTerm.toLowerCase())));

        let matchesCat = true;
        if (listingType === "tool" && selectedToolCategory !== "All") {
            const term = selectedToolCategory.toLowerCase();
            matchesCat = !!(l.title.toLowerCase().includes(term) ||
                (l.description && l.description.toLowerCase().includes(term)));
        }

        let matchesRadius = true;
        if (selectedRadius && userLocation) {
            const distance = getDistance(
                userLocation[0],
                userLocation[1],
                l.latitude || defaultCenter[0],
                l.longitude || defaultCenter[1]
            );
            matchesRadius = distance <= selectedRadius;
        }

        return matchesSearch && matchesCat && matchesRadius;
    });

    const handlePreBook = () => {
        if (!selectedListing) return;
        startTransition(async () => {
            const { error } = await preBookListing(selectedListing.id);
            if (error) {
                alert(error); // In production, use standard toast notification
            } else {
                router.push("/bookings");
            }
        });
    };

    return (
        <div className="relative w-full h-full">
            {/* Search Bar & Toggles Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[400] space-y-3 pointer-events-none">
                {/* Search Header */}
                <div className="flex gap-2">
                    <div className="flex-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 px-4 py-3.5 flex items-center pointer-events-auto">
                        <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Search ${listingType === "space" ? "parking" : "tools"}...`}
                            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-400 text-gray-900 font-bold"
                        />
                    </div>
                    <button
                        onClick={() => setIsRadiusSheetOpen(true)}
                        className={`p-3.5 rounded-2xl shadow-lg border pointer-events-auto active:scale-95 transition-all flex items-center justify-center gap-2 ${selectedRadius
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-gray-700 border-gray-100"
                            }`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        {selectedRadius && <span className="text-xs font-black">{selectedRadius}km</span>}
                    </button>
                </div>

                {/* Horizontal Tool Categories Toggle Bar */}
                {listingType === "tool" && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 pointer-events-auto px-1">
                        {toolCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedToolCategory(cat)}
                                className={`px-5 py-2.5 shrink-0 rounded-xl text-xs font-black transition-all shadow-sm ${selectedToolCategory === cat
                                    ? "bg-gray-900 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Recenter FAB */}
            <button
                onClick={handleRecenter}
                className="absolute right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[400] bg-white text-gray-700 p-3 rounded-full shadow-lg border border-gray-100 active:scale-95 transition-transform"
            >
                <LocateFixed className="w-6 h-6" />
            </button>

            {/* The Map — wrapped in z-0 stacking context to keep Leaflet panes below overlays */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={initialCenter}
                    zoom={14}
                    zoomControl={false}
                    style={{ width: "100%", height: "100%" }}
                    ref={mapRef}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    <MapController center={userLocation} />
                    <MapEvents />

                    {filteredListings.map((listing) => {
                        const lat = listing.latitude || 0;
                        const lng = listing.longitude || 0;
                        const finalLat = lat === 0 ? defaultCenter[0] + (Math.random() - 0.5) * 0.05 : lat;
                        const finalLng = lng === 0 ? defaultCenter[1] + (Math.random() - 0.5) * 0.05 : lng;

                        return (
                            <Marker
                                key={listing.id}
                                position={[finalLat, finalLng]}
                                icon={getIcon(listing.category, listing.has_ev_charging || false)}
                                eventHandlers={{
                                    click: () => {
                                        setSelectedListing(listing);
                                    },
                                }}
                            />
                        );
                    })}

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
            </div>

            {/* Bottom Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] transition-transform duration-300 ease-out ${selectedListing ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                {selectedListing && (
                    <div className="p-5 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col">
                        {/* Drag Handle */}
                        <div
                            className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5 cursor-pointer"
                            onClick={() => setSelectedListing(null)}
                        />

                        {/* Top Section: Image & Basic Info */}
                        <div className="flex gap-4">
                            <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                                {selectedListing.image_url && (
                                    <Image
                                        src={selectedListing.image_url}
                                        alt={selectedListing.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col min-w-0 py-1">
                                <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
                                    {selectedListing.title}
                                </h3>

                                {selectedListing.address_text && (
                                    <p className="text-gray-500 text-sm mt-1 truncate">
                                        {selectedListing.address_text}
                                    </p>
                                )}

                                {selectedListing.has_ev_charging && (
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mt-2 w-fit">
                                        ⚡ EV Charging
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner Details */}
                        <div className="mt-5 p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden relative">
                                    {selectedListing.owner?.avatar_url ? (
                                        <Image src={selectedListing.owner.avatar_url} alt="Owner" fill className="object-cover" />
                                    ) : (
                                        selectedListing.owner?.full_name?.charAt(0) || "U"
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 text-sm">
                                        {selectedListing.owner?.full_name || "Unknown Owner"}
                                    </span>
                                    <div className="flex items-center text-amber-500 text-xs">
                                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                        <span className="font-bold">{selectedListing.owner?.trust_score || "5.0"}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 active:scale-95 transition-transform">
                                Profile
                            </button>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                                <div className="flex items-baseline">
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{selectedListing.price_per_day || 0}
                                    </span>
                                    <span className="text-gray-500 text-sm ml-1 font-medium">/ day</span>
                                </div>
                            </div>
                            <button
                                onClick={handlePreBook}
                                disabled={isPending}
                                className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold tracking-tight shadow-md active:scale-95 transition-transform flex items-center justify-center min-w-[140px]"
                            >
                                {isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    "Pre-Book Now"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Radius Selection Sheet */}
            <RadiusFilterSheet
                isOpen={isRadiusSheetOpen}
                onClose={() => setIsRadiusSheetOpen(false)}
                selectedRadius={selectedRadius}
                onSelect={setSelectedRadius}
            />
        </div>
    );
}
