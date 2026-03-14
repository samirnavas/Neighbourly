"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Explore() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") === "tools" ? "tools" : "parking";

  const [selectedPin, setSelectedPin] = useState<number | null>(null);

  const categories = [
    { label: "Parking", value: "parking" },
    { label: "Tools", value: "tools" },
  ] as const;

  const pins = [
    { id: 1, category: "parking", title: "Private Driveway", distance: "0.2 mi away", price: 15, x: "33%", y: "50%" },
    { id: 2, category: "parking", title: "Secure Garage Spot", distance: "0.5 mi away", price: 22, x: "62%", y: "42%" },
    { id: 3, category: "tools", title: "Cordless Drill Kit", distance: "0.3 mi away", price: 12, x: "52%", y: "58%" },
    { id: 4, category: "tools", title: "Pressure Washer", distance: "0.7 mi away", price: 18, x: "38%", y: "68%" },
  ] as const;

  const filteredPins = useMemo(
    () => pins.filter((pin) => pin.category === categoryParam),
    [categoryParam],
  );

  const selectedListing = filteredPins.find((pin) => pin.id === selectedPin) ?? filteredPins[0];

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gray-100">
      {/* Fake Map Background */}
      <div className="absolute inset-0 z-0 bg-[#e5e3df]" />

      {/* Floating UI */}
      <div className="absolute top-12 left-4 right-4 z-10 space-y-3">
        {/* Search Bar */}
        <div className="flex items-center bg-white/90 backdrop-blur-xl shadow-lg rounded-full px-4 py-3 border border-gray-100">
          <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search "
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 font-medium tracking-tight"
          />
          <div className="pl-3 border-l border-gray-200">
            <SlidersHorizontal className="w-5 h-5 text-gray-700" />
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedPin(null);
                router.replace(`/explore?category=${cat.value}`);
              }}
              className={`min-w-[46%] px-6 py-3 shadow-md rounded-2xl text-base font-semibold whitespace-nowrap border active:scale-[0.98] transition-transform ${categoryParam === cat.value
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-900 border-gray-200"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Pins */}
      <div className="absolute inset-0 z-0">
        {filteredPins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelectedPin(pin.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            style={{ left: pin.x, top: pin.y }}
          >
            <div className="bg-emerald-800 text-white px-3 py-1 rounded-full font-bold shadow-md relative">
              ${pin.price}
              <div className="absolute w-2 h-2 bg-emerald-800 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Sheet Modal */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-50 transition-transform duration-300 ease-out ${selectedPin ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="p-6 pb-24 flex flex-col items-center">
          {/* Drag Handle */}
          <div
            className="w-12 h-1.5 bg-gray-300 rounded-full mb-6 cursor-pointer"
            onClick={() => setSelectedPin(null)}
          />

          <div className="w-full flex gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-1">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{selectedListing?.title ?? "Nearby Listing"}</h3>
              <p className="text-gray-500 text-sm">{selectedListing?.distance ?? "0.0 mi away"}</p>
              <div className="flex items-center text-emerald-800 font-bold pt-1">
                ${selectedListing?.price ?? 0} <span className="text-gray-500 text-sm font-normal ml-1">/ day</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 bg-gray-900 text-white py-3.5 rounded-2xl font-semibold tracking-tight active:scale-[0.98] transition-transform">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
