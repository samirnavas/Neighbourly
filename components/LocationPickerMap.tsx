"use client";

import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, X } from "lucide-react";
import { reverseGeocode } from "@/app/actions/geocode";

export default function LocationPickerMap({
    initialCenter,
    onConfirm,
    onCancel
}: {
    initialCenter: [number, number];
    onConfirm: (lat: number, lng: number, address: string) => void;
    onCancel: () => void;
}) {
    const [center, setCenter] = useState<[number, number]>(initialCenter);
    const [loading, setLoading] = useState(false);

    function MapEvents() {
        useMapEvents({
            move: (e) => {
                const map = e.target;
                const newCenter = map.getCenter();
                setCenter([newCenter.lat, newCenter.lng]);
            }
        });
        return null;
    }

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const address = await reverseGeocode(center[0], center[1]);
            onConfirm(center[0], center[1], address);
        } catch (error) {
            console.error("Geocoding failed", error);
            onConfirm(center[0], center[1], "Unknown address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center p-4 bg-white shadow-sm z-[201] relative">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Select Location</h2>
                <button onClick={onCancel} className="p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 relative z-[200]">
                <MapContainer center={initialCenter} zoom={15} zoomControl={false} style={{ width: "100%", height: "100%" }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    <MapEvents />
                </MapContainer>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] z-[400] pointer-events-none drop-shadow-xl">
                    <MapPin className="w-12 h-12 text-gray-900 fill-white drop-shadow-lg" strokeWidth={1.5} />
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mx-auto mt-1 blur-[1px]"></div>
                </div>
            </div>

            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[201] relative">
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center transition-colors shadow-xl active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Confirm Location
                </button>
            </div>
        </div>
    );
}
