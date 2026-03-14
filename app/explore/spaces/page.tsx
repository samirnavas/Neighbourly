import { createClient } from "@/lib/supabase/server";
import { MobileMap } from "@/components/MobileMap";

export const dynamic = "force-dynamic";

export default async function ExploreSpacesPage() {
    const supabase = await createClient();
    
    const { data: listings } = await supabase
        .from("listings")
        .select(`
            id, 
            title, 
            description,
            category, 
            price_per_hour, 
            ev_charging_available, 
            ev_price_per_hour, 
            latitude, 
            longitude, 
            image_url, 
            address_text, 
            owner:profiles!owner_id(full_name, avatar_url, trust_score)
        `)
        .eq("category", "space")
        .eq("is_active", true);

    return (
        <div className="relative w-full h-[100dvh]">
            <MobileMap listingType="space" initialListings={listings || []} />
        </div>
    );
}
