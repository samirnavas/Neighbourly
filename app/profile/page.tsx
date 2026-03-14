import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Star, Package, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch the user's profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Fetch user's past bookings to find frequently used
    const { data: bookings } = await supabase
        .from("bookings")
        .select(`
            listing_id,
            listings:listing_id (
                id,
                title,
                category,
                image_url
            )
        `)
        .eq("renter_id", user.id);

    // Aggregate frequently used
    const frequencyMap = new Map();
    if (bookings) {
        for (const b of bookings) {
            if (b.listings) {
                // listings can be array if foreign key isn't strictly single, but by schema it is a single listing object
                const lis = (Array.isArray(b.listings) ? b.listings[0] : b.listings) as Record<string, unknown>;
                if (!lis) continue;
                
                const lisId = String(lis.id);
                const count = frequencyMap.get(lisId)?.count || 0;
                frequencyMap.set(lisId, {
                    listing: lis,
                    count: count + 1
                });
            }
        }
    }

    const frequentlyUsed = Array.from(frequencyMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    return (
        <div className="min-h-[100dvh] bg-gray-50 pb-[80px] overflow-y-auto">
            {/* Header / Banner */}
            <div className="bg-white px-4 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center border-b border-gray-100 relative">
                
                <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>

                <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-bold overflow-hidden mb-4 border-[6px] border-white shadow-xl relative">
                    {profile?.avatar_url ? (
                        <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
                    ) : (
                        profile?.full_name?.charAt(0) || "U"
                    )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{profile?.full_name || "Unknown User"}</h1>
                <p className="text-gray-500 font-medium text-sm mt-1">{profile?.phone_number || "No phone added"}</p>
                
                <div className="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 px-5 py-2.5 rounded-full font-bold flex items-center mt-5 shadow-sm border border-amber-200/50">
                    <Star className="w-5 h-5 mr-1.5 fill-amber-500 text-amber-500" />
                    {Number(profile?.trust_score || 5.0).toFixed(1)} <span className="text-amber-600/70 ml-1.5 font-medium text-sm">Trust Score</span>
                </div>
            </div>

            <div className="p-4 mt-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight flex items-center">
                    Frequently Used
                    <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">{frequentlyUsed.length}</span>
                </h2>
                
                {frequentlyUsed.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 opacity-80" />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">No items yet</h3>
                        <p className="text-gray-500 font-medium text-sm">Rent spaces or tools to see your favorites here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {frequentlyUsed.map((item) => (
                            <div key={item.listing.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center active:scale-[0.98] transition-transform">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative mr-4">
                                    {item.listing.image_url ? (
                                        <Image src={item.listing.image_url} alt={item.listing.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Package className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <h3 className="font-bold text-gray-900 leading-tight truncate">{item.listing.title}</h3>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">{item.listing.category}</p>
                                    <p className="text-xs font-semibold text-gray-400 mt-1 flex items-center">
                                        Rented {item.count} time{item.count > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button className="ml-auto bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-gray-800 transition-colors">
                                    Re-book
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
