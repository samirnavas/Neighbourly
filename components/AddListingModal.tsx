"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { X, MapPin, Target, Loader2, Image as ImageIcon, Map as MapIcon } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useLocation } from "@/components/LocationContext";
import { reverseGeocode } from "@/app/actions/geocode";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), { ssr: false });

export default function AddListingModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"space" | "tool">("space");
  const [price, setPrice] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressText, setAddressText] = useState("");
  const [showMap, setShowMap] = useState(false);
  const { latitude: userLat, longitude: userLng } = useLocation();
  const router = useRouter();
  const supabase = createClient();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

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
        description,
        category,
        price_per_day: parseFloat(price),
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        image_url: imageUrl || null,
        address_text: addressText || null
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
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));

      try {
        const address = await reverseGeocode(lat, lng);
        setAddressText(address);
      } catch (err) {
        setAddressText("Current Location");
      }
    });
  };

  const titlePlaceholder = category === 'space' ? "e.g. Covered Driveway near Metro" : "e.g. Bosch Power Drill";
  const descPlaceholder = category === 'space' ? "e.g. Secure, gated parking spot available 9AM-5PM..." : "e.g. Heavy-duty drill, includes all bits...";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 pb-12 sm:pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Add Listing</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Listing Title</label>
              <input
                type="text"
                placeholder={titlePlaceholder}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
              <textarea
                placeholder={descPlaceholder}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium resize-none"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Photos</label>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm shrink-0">
                    <Image src={imageUrl} alt="Uploaded preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:bg-gray-100 transition-colors group overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    />
                    {imageUploading ? (
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 mb-1 transition-colors" />
                        <span className="text-xs font-bold text-gray-400 group-hover:text-emerald-600 transition-colors">Upload Image</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Price / day</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-10 pr-5 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Location</label>

              {latitude ? (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-medium text-emerald-800 line-clamp-1 flex-1">
                    {addressText || `${latitude}, ${longitude}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setLatitude(""); setLongitude(""); setAddressText(""); }}
                    className="shrink-0 text-emerald-600 hover:bg-emerald-100 p-1.5 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex-1 h-[50px] bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all border border-gray-200 shadow-sm"
                >
                  <Target className="w-4 h-4" />
                  Use Current
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="flex-1 h-[50px] bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-indigo-100 active:scale-95 transition-all border border-indigo-100 shadow-sm"
                >
                  <MapIcon className="w-4 h-4" />
                  Select Map
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || imageUploading || !latitude}
            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 mt-2 flex items-center justify-center"
          >
            {loading || imageUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
        </form>

        {showMap && (
          <LocationPickerMap
            initialCenter={latitude ? [parseFloat(latitude), parseFloat(longitude)] : [(userLat || 51.505), (userLng || -0.09)]}
            onConfirm={(lat, lng, address) => {
              setLatitude(lat.toFixed(6));
              setLongitude(lng.toFixed(6));
              setAddressText(address);
              setShowMap(false);
            }}
            onCancel={() => setShowMap(false)}
          />
        )}
      </div>
    </div>
  );
}
