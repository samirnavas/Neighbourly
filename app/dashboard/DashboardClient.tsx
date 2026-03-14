"use client";

import { useState } from "react";
import { Plus, Edit, MessageSquare, Star, Zap } from "lucide-react";
import Image from "next/image";
import AddListingModal from "./AddListingModal";

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

export default function DashboardClient({
  myListings,
  currentlyRentedOut,
}: {
  myListings: Listing[];
  currentlyRentedOut: RentedOut[];
}) {
  const [activeTab, setActiveTab] = useState<"listings" | "rented">("listings");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-[100dvh] bg-gray-50 pb-24">
      {/* Header Tabs */}
      <div className="pt-6 pb-2 px-4 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Dashboard</h1>
        
        {/* Sleek Segmented Control */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "listings"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab("rented")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "rented"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Currently Rented Out
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === "listings" ? (
          myListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <p className="text-gray-500">You haven&apos;t added any listings yet.</p>
            </div>
          ) : (
            myListings.map((listing) => (
              <div
                key={listing.id}
                className="flex bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 items-center pr-4"
              >
                <div className="relative w-28 h-28 flex-shrink-0">
                  <Image
                    src={listing.image_url || "https://images.unsplash.com/photo-1542338106-fa7098e988cf?q=80&w=2674&auto=format&fit=crop"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                      {listing.category}
                    </div>
                    <h3 className="font-semibold text-gray-900 leading-tight line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-2">
                      ${listing.price_per_hour}/hr
                      {listing.ev_charging_available && (
                        <span className="inline-flex items-center text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">
                          <Zap className="w-3 h-3 mr-0.5" /> EV: +${listing.ev_price_per_hour}/hr
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            ))
          )
        ) : (
          currentlyRentedOut.length === 0 ? (
            <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              No items are currently rented out.
            </div>
          ) : (
            currentlyRentedOut.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{booking.listings.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="capitalize">{booking.status.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      ${booking.total_price}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden relative">
                       {booking.renter.avatar_url ? (
                         <Image src={booking.renter.avatar_url} alt="avatar" fill className="object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                           {booking.renter.full_name?.charAt(0) || "U"}
                         </div>
                       )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.renter.full_name || "Unknown Renter"}
                      </div>
                      <div className="flex items-center text-xs text-amber-500">
                        <Star className="w-3 h-3 fill-current mr-0.5" />
                        <span>{parseFloat(booking.renter.trust_score || "5.0").toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-transform active:scale-95 z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Listing Modal */}
      {isModalOpen && (
        <AddListingModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
