"use client";

import { X } from "lucide-react";

type RadiusOption = 1 | 5 | 10 | 25 | null;

interface RadiusFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRadius: RadiusOption;
  onSelect: (radius: RadiusOption) => void;
}

export default function RadiusFilterSheet({
  isOpen,
  onClose,
  selectedRadius,
  onSelect,
}: RadiusFilterSheetProps) {
  const options: { label: string; value: RadiusOption }[] = [
    { label: "1 km", value: 1 },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "Anywhere", value: null },
  ];

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-end justify-center sm:items-center p-0 sm:p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div
        className={`relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 pb-12 sm:pb-8 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full sm:translate-y-10 sm:scale-95"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Search Radius</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 active:scale-90 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-500 font-medium mb-8">
          Only show listings within a certain distance from your current location.
        </p>

        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                onSelect(option.value);
                onClose();
              }}
              className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between border-2 transition-all active:scale-[0.98] ${
                selectedRadius === option.value
                  ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm"
                  : "bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-200"
              }`}
            >
              <span className="font-bold text-lg">{option.label}</span>
              {selectedRadius === option.value && (
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
