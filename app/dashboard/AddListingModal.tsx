"use client";

import { useState, useTransition } from "react";
import { X, UploadCloud, MapPin, DollarSign, Zap, ImageIcon } from "lucide-react";
import { createFullListing } from "./actions";

export default function AddListingModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<"space" | "tool">("space");
  const [evCharging, setEvCharging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("category", category);
    if (category === "space" && evCharging) {
      formData.append("ev_charging_available", "on");
    }

    startTransition(async () => {
      const { error } = await createFullListing(formData);
      if (!error) {
        onClose();
      } else {
        alert(error); // In a real app we'd use a toast
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <h2 className="text-xl font-bold text-gray-900">Add New Listing</h2>
        <button
          onClick={onClose}
          className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
        <form id="add-listing-form" onSubmit={handleSubmit} className="space-y-6 pb-20">
          
          {/* Image Upload Mock */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Photo</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
              <UploadCloud className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Tap to upload photo</span>
              <span className="text-xs text-gray-400 mt-1">JPEG, PNG up to 5MB</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            {/* Category Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCategory("space")}
                  className={`flex-1 py-3 px-4 flex justify-center items-center gap-2 text-sm font-semibold rounded-md transition-all ${
                    category === "space"
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                      : "text-gray-500"
                  }`}
                >
                  <MapPin className="w-4 h-4" /> Space
                </button>
                <button
                  type="button"
                  onClick={() => setCategory("tool")}
                  className={`flex-1 py-3 px-4 flex justify-center items-center gap-2 text-sm font-semibold rounded-md transition-all ${
                    category === "tool"
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                      : "text-gray-500"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" /> Tool
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                required
                name="title"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                placeholder="e.g. Premium Driveway Parking"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                required
                name="description"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none"
                placeholder="Describe your item or space..."
              ></textarea>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  name="address_text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  placeholder="123 Main St, City"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price per Hour</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  name="price_per_hour"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  placeholder="5.00"
                />
              </div>
            </div>
          </div>

          {/* EV Charging Sub-section */}
          {category === "space" && (
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    EV Charging Available
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Allow renters to charge their EV</p>
                </div>
                {/* Custom Toggle */}
                <button
                  type="button"
                  onClick={() => setEvCharging(!evCharging)}
                  className={`w-12 h-7 rounded-full transition-colors relative flex items-center ${
                    evCharging ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                      evCharging ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {evCharging && (
                <div className="pt-3 border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">EV Surcharge per Hour</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      name="ev_price_per_hour"
                      type="number"
                      step="0.01"
                      min="0"
                      required={evCharging}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                      placeholder="2.50"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This will be added on top of your base hourly price.
                  </p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Footer Fixed Action */}
      <div className="border-t border-gray-100 p-4 bg-white">
        <button
          form="add-listing-form"
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center"
        >
          {isPending ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            "Publish Listing"
          )}
        </button>
      </div>
    </div>
  );
}
