"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { X, MapPin, Target } from "lucide-react";

export default function AddListingModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"space" | "tool">("space");
  const [price, setPrice] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        owner_id: user.id,
        title,
        category,
        price_per_hour: parseFloat(price),
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
      })
      .select()
      .single();

    if (!error) {
      onClose();
      router.refresh();
    } else {
      console.error(error);
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
       setLatitude(pos.coords.latitude.toFixed(6));
       setLongitude(pos.coords.longitude.toFixed(6));
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 pb-12 sm:pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Add Listing</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl border border-gray-200/50">
            <button
               type="button"
               onClick={() => setCategory("space")}
               className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${category === 'space' ? 'bg-white shadow-md text-emerald-700' : 'text-gray-500'}`}
            >
                Parking Space
            </button>
            <button
               type="button"
               onClick={() => setCategory("tool")}
               className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${category === 'tool' ? 'bg-white shadow-md text-amber-700' : 'text-gray-500'}`}
            >
                Tool/Equipment
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Listing Title</label>
            <input 
              type="text" 
              placeholder="e.g. Professional Power Washer" 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Price /hr</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-10 pr-6 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Location</label>
               <button 
                 type="button"
                 onClick={handleUseCurrentLocation}
                 className="w-full h-[58px] bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-transform"
               >
                 <MapPin className="w-4 h-4" />
                 {latitude ? 'Location Set' : 'Use Current'}
               </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
