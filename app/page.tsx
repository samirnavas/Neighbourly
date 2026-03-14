"use client";

import { Bell, Search, Car, Wrench, Star, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLocation } from "@/components/LocationContext";
import { useMemo, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Haversine formula to calculate distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Home() {
  const { latitude, longitude, isLoading: isLocationLoading } = useLocation();
  const [userName, setUserName] = useState("Neighbour");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (data && data.full_name) {
          const firstName = data.full_name.split(' ')[0];
          setUserName(firstName);
        }
      }
      setIsLoadingUser(false);
    }
    fetchUser();
  }, []);

  const dummyListings = [
    {
      id: 1,
      title: "Electric Pressure Washer",
      price: "₹15/d",
      rating: 4.9,
      reviews: 24,
      image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=2600&auto=format&fit=crop",
      lat: 51.5074,
      lng: -0.1278,
    },
    {
      id: 2,
      title: "Secure EV Parking Space",
      price: "₹45/hr",
      rating: 4.8,
      reviews: 56,
      image: "https://images.unsplash.com/photo-1506521781263-d8422e8ecf27?q=80&w=2574&auto=format&fit=crop",
      lat: 51.5152,
      lng: -0.1419,
    },
    {
      id: 3,
      title: "DeWalt Cordless Drill Set",
      price: "₹20/d",
      rating: 5.0,
      reviews: 12,
      image: "https://images.unsplash.com/photo-1504148455328-c99669103557?q=80&w=2670&auto=format&fit=crop",
      lat: 51.498,
      lng: -0.177,
    },
    {
      id: 4,
      title: "Commercial Grade Lawn Mower",
      price: "₹35/d",
      rating: 4.7,
      reviews: 31,
      image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=2600&auto=format&fit=crop",
      lat: 51.52,
      lng: -0.1,
    },
    {
      id: 5,
      title: "Central London Parking Pad",
      price: "₹12/hr",
      rating: 4.9,
      reviews: 88,
      image: "https://images.unsplash.com/photo-1590674000103-30c74c83b246?q=80&w=2574&auto=format&fit=crop",
      lat: 51.5033,
      lng: -0.1195,
    }
  ];

  const filteredItems = useMemo(() => {
    if (!latitude || !longitude) return [];

    return dummyListings
      .map(item => ({
        ...item,
        distanceVal: getDistance(latitude, longitude, item.lat, item.lng)
      }))
      .filter(item => item.distanceVal <= 10) // Within 10km
      .sort((a, b) => a.distanceVal - b.distanceVal)
      .slice(0, 3);
  }, [latitude, longitude]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white pb-24">
      {/* Top Bar */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white sticky top-0 z-20">
        <div>
          <p className="text-gray-500 text-sm font-medium">Saturday, March 14</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Good morning, {isLoadingUser ? "..." : userName}</h1>
        </div>
        <div className="relative p-2.5 bg-gray-50 rounded-2xl border border-gray-100 active:scale-95 transition-transform">
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white"></span>
        </div>
      </header>

      <main className="flex-1">
        {/* Search Bar */}
        <div className="px-6 mt-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-700 transition-colors" />
            <input
              type="text"
              placeholder="Search for tools or parking..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-sm"
              readOnly
            />
          </div>
        </div>

        {/* Quick Actions */}
        <section className="px-6 mt-8">
          <div className="flex gap-4">
            <Link
              href="/explore/spaces"
              className="flex-1 bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100/50 active:scale-95 transition-transform group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6 text-emerald-800" />
              </div>
              <h3 className="font-bold text-emerald-900 text-lg tracking-tight">Find<br />Parking</h3>
            </Link>
            <Link
              href="/explore/tools"
              className="flex-1 bg-amber-50 p-6 rounded-[2rem] border border-amber-100/50 active:scale-95 transition-transform group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="font-bold text-amber-900 text-lg tracking-tight">Borrow<br />Tools</h3>
            </Link>
          </div>
        </section>

        {/* Featured Section */}
        <section className="mt-10">
          <div className="px-6 mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Featured Near You</h2>
            <button className="text-emerald-700 font-bold text-sm">See All</button>
          </div>

          <div className="flex overflow-x-auto gap-5 px-6 pb-4 scrollbar-hide">
            {isLocationLoading ? (
              // Loading Skeleton
              [1, 2, 3].map((i) => (
                <div key={i} className="min-w-[280px] bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded-full w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.id} className="min-w-[280px] bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm active:scale-[0.98] transition-transform">
                  <div className="relative h-48">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-2xl shadow-sm border border-white/20">
                      <span className="text-sm font-bold text-gray-900">{item.price}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 leading-tight flex-1 pr-2 line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                        <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                        <span className="text-xs font-bold text-amber-700">{item.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{item.distanceVal.toFixed(1)} km away • {item.reviews} reviews</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 min-w-[300px]">
                <p className="text-gray-500 font-medium">No items found within 10km.</p>
              </div>
            )}
          </div>
        </section>

        {/* Community Banner */}
        <section className="px-6 mt-4 pb-12">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-white text-xl font-bold mb-2">Join the community</h3>
              <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">List your idle items and start earning today.</p>
              <button className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-transform">
                List an Item
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
          </div>
        </section>
      </main>
    </div>
  );
}
