import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Star, LogOut, Settings } from "lucide-react";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // 1. Fetch user's profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // 2. Fetch "My Listings" (Dashboard Logic)
    const { data: myListings } = await supabase
        .from("listings")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

    // 3. Fetch "Currently Rented Out" (Dashboard Logic)
    const { data: currentlyRentedOut } = await supabase
        .from("bookings")
        .select(`
            *,
            listings!inner(id, title, category, owner_id)
        `)
        .eq("listings.owner_id", user.id)
        .in("status", ["pending", "active", "awaiting_payment"])
        .order("created_at", { ascending: false });

    // Fetch renter profiles for these bookings
    const renterIds = [...new Set((currentlyRentedOut ?? []).map((b: any) => b.renter_id).filter(Boolean))];
    const { data: renterProfiles } = renterIds.length
        ? await supabase.from("profiles").select("id, full_name, avatar_url, trust_score").in("id", renterIds)
        : { data: [] };

    const renterMap = Object.fromEntries((renterProfiles ?? []).map((p: any) => [p.id, p]));
    const rentedOutWithRenter = (currentlyRentedOut ?? []).map((b: any) => ({
        ...b,
        renter: renterMap[b.renter_id] ?? null,
    }));

    // 4. Fetch Frequently Used (Original Profile Logic)
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

    const frequencyMap = new Map();
    if (bookings) {
        for (const b of bookings) {
            if (b.listings) {
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
        .slice(0, 5);

    return (
        <div className="min-h-[100dvh] bg-white pb-[80px] overflow-y-auto">
            {/* Header / Banner */}
            <div className="px-6 pt-16 pb-8 flex flex-col items-center bg-white relative">
                
                <div className="absolute top-12 right-6 flex gap-3">
                    <button className="p-2.5 text-gray-500 bg-gray-50 border border-gray-100 rounded-2xl active:scale-95 transition-transform">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 text-red-500 bg-red-50 border border-red-100 rounded-2xl active:scale-95 transition-transform">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center text-emerald-700 text-4xl font-bold overflow-hidden mb-6 border-[8px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative">
                    {profile?.avatar_url ? (
                        <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
                    ) : (
                        profile?.full_name?.charAt(0) || "U"
                    )}
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profile?.full_name || "Unknown Neighbor"}</h1>
                <p className="text-gray-500 font-bold text-sm mt-1.5 uppercase tracking-widest px-4 py-1 bg-gray-50 rounded-lg">Verified Resident</p>
                
                <div className="flex gap-4 mt-8 w-full px-4">
                    <div className="flex-1 bg-amber-50 rounded-3xl p-5 border border-amber-100/50 flex flex-col items-center shadow-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            <span className="text-xl font-black text-amber-900 leading-none">
                                {Number(profile?.trust_score || 5.0).toFixed(1)}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Trust Score</span>
                    </div>
                    <div className="flex-1 bg-emerald-50 rounded-3xl p-5 border border-emerald-100/50 flex flex-col items-center shadow-sm">
                        <span className="text-xl font-black text-emerald-900 mb-1 leading-none">{myListings?.length || 0}</span>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Items Listed</span>
                    </div>
                </div>
            </div>

            <main className="mt-4">
                <ProfileClient 
                    myListings={myListings || []} 
                    currentlyRentedOut={rentedOutWithRenter}
                    frequentlyUsed={frequentlyUsed}
                />
            </main>
        </div>
    );
}
