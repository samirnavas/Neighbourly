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

    // Fetch all bookings for the current user
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
                owner:profiles!owner_id(full_name, avatar_url, phone_number, trust_score)
            )
        `)
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching bookings:", error.message);
    }

    // Categorize bookings
    const activeBookings = bookings?.filter(b => b.status === "active" || b.status === "awaiting_payment") || [];
    const pendingBookings = bookings?.filter(b => b.status === "pending") || [];
    const pastBookings = bookings?.filter(b => b.status === "completed" || b.status === "cancelled") || [];

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
