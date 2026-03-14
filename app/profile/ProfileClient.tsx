"use client";

import { useState } from "react";
import { Plus, Edit, MessageSquare, Star, Zap, Package } from "lucide-react";
import Image from "next/image";
import AddListingModal from "@/components/AddListingModal";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  trust_score: string | null;
};

type Listing = {
  id: string;
  title: string;
  category: "space" | "tool";
  price_per_hour: number | null;
  image_url: string | null;
  owner_id: string;
  ev_charging_available: boolean;
  ev_price_per_hour: number | null;
};

type RentedOut = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  renter: Profile;
  listings: Listing;
  total_price: number;
};

type FrequentlyUsed = {
    listing: any;
    count: number;
};

export default function ProfileClient({
  myListings,
  currentlyRentedOut,
  frequentlyUsed,
}: {
  myListings: Listing[];
  currentlyRentedOut: RentedOut[];
  frequentlyUsed: FrequentlyUsed[];
}) {
  const [activeTab, setActiveTab] = useState<"listings" | "rented" | "history">("listings");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Sleek Segmented Control */}
      <div className="px-4 mb-6">
        <div className="flex p-1.5 bg-gray-100 rounded-[1.25rem] border border-gray-200/50">
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === "listings"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab("rented")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === "rented"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Occupied
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === "history"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Frequent
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-24 space-y-4">
        {activeTab === "listings" && (
          myListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <Plus className="w-10 h-10" />
              </div>
              <h3 className="text-gray-900 font-bold mb-2 text-lg">No listings yet</h3>
              <p className="text-gray-500 font-medium">Earn money by sharing your tools or parking space with neighbors.</p>
            </div>
          ) : (
            myListings.map((listing) => (
              <div
                key={listing.id}
                className="flex bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100 items-center pr-4 active:scale-[0.98] transition-transform"
              >
                <div className="relative w-28 h-28 flex-shrink-0">
                  <Image
                    src={listing.image_url || "https://images.unsplash.com/photo-1542338106-fa7098e988cf?q=80&w=2674&auto=format&fit=crop"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                      {listing.category}
                    </div>
                    <h3 className="font-bold text-gray-900 leading-tight line-clamp-1 text-base">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 font-bold flex items-center gap-2">
                      ${listing.price_per_hour}/hr
                      {listing.ev_charging_available && (
                        <span className="inline-flex items-center text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                          <Zap className="w-3 h-3 mr-0.5 fill-current" /> EV READY
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            ))
          )
        )}

        {activeTab === "rented" && (
          currentlyRentedOut.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10" />
              </div>
              <h3 className="text-gray-900 font-bold mb-2 text-lg">Nothing rented out</h3>
              <p className="text-gray-500 font-medium">Your assets are currently idle.</p>
            </div>
          ) : (
            currentlyRentedOut.map((booking) => (
              <div key={booking.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-5 overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{booking.listings.title}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg uppercase tracking-wider">
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-gray-900">
                      ${booking.total_price}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-50">
                       {booking.renter.avatar_url ? (
                         <Image src={booking.renter.avatar_url} alt="avatar" fill className="object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-lg">
                           {booking.renter.full_name?.charAt(0) || "U"}
                         </div>
                       )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {booking.renter.full_name || "Unknown Neighbors"}
                      </div>
                      <div className="flex items-center text-xs font-bold text-amber-500 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        <span>{parseFloat(booking.renter.trust_score || "5.0").toFixed(1)} Trust</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="flex items-center justify-center w-12 h-12 bg-gray-900 text-white rounded-2xl shadow-lg active:scale-95 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === "history" && (
            frequentlyUsed.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
                        <Star className="w-10 h-10" />
                    </div>
                    <h3 className="text-gray-900 font-bold mb-2 text-lg">No favorites yet</h3>
                    <p className="text-gray-500 font-medium">Items you rent frequently will appear here.</p>
                </div>
            ) : (
                frequentlyUsed.map((item) => (
                    <div key={item.listing.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex items-center active:scale-[0.98] transition-transform">
                        <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0 relative mr-4 border border-gray-100">
                            {item.listing.image_url ? (
                                <Image src={item.listing.image_url} alt={item.listing.title} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-bold text-gray-900 leading-tight truncate text-base">{item.listing.title}</h3>
                            <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest mt-1 bg-blue-50 w-fit px-2 py-0.5 rounded-md">{item.listing.category}</p>
                            <p className="text-xs font-bold text-gray-400 mt-1.5 flex items-center">
                                Re-used {item.count} times
                            </p>
                        </div>
                        <button className="ml-auto bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg active:scale-95 transition-transform">
                            Rent
                        </button>
                    </div>
                ))
            )
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-[0_8px_30px_rgb(16,185,129,0.4)] hover:bg-emerald-700 transition-all active:scale-95 active:rotate-90 z-40"
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </button>

      {/* Add Listing Modal */}
      {isModalOpen && (
        <AddListingModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
