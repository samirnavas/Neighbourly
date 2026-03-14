import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookingsClient from "./BookingsClient";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
    const supabase = await createClient();

    // Ensure user is auth'd
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch all bookings for the current user (without nested profile join since
    // listings.owner_id → auth.users, not profiles — PostgREST can't traverse it)
    const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
            *,
            listings:listing_id (
                id,
                title,
                category,
                price_per_hour,
                ev_charging_available,
                ev_price_per_hour,
                image_url,
                address_text,
                owner_id
            )
        `)
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching bookings:", error.message);
    }

    // Fetch owner profiles separately
    const ownerIds = [...new Set(bookings?.map((b: any) => b.listings?.owner_id).filter(Boolean))];
    const { data: profiles } = ownerIds.length
        ? await supabase.from("profiles").select("id, full_name, avatar_url, phone_number, trust_score").in("id", ownerIds)
        : { data: [] };

    const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]));

    // Merge owner into each listing
    const bookingsWithOwner = (bookings ?? []).map((b: any) => ({
        ...b,
        listings: b.listings
            ? { ...b.listings, owner: profileMap[b.listings.owner_id] ?? null }
            : b.listings,
    }));

    // Categorize bookings
    const activeBookings = bookingsWithOwner.filter((b: any) => b.status === "active" || b.status === "awaiting_payment");
    const pendingBookings = bookingsWithOwner.filter((b: any) => b.status === "pending");
    const pastBookings = bookingsWithOwner.filter((b: any) => b.status === "completed" || b.status === "cancelled");

    return (
        <div className="flex flex-col h-[100dvh] bg-gray-50 pb-[60px] overflow-hidden">
            <BookingsClient
                activeBookings={activeBookings}
                pendingBookings={pendingBookings}
                pastBookings={pastBookings}
            />
        </div>
    );
}
