import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Ensure user is auth'd
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login"); // or basic redirect
  }

  // Fetch "My Listings"
  const { data: myListings, error: listingsError } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (listingsError) {
    console.error("Error fetching listings:", listingsError.message);
  }

  // Fetch "Currently Rented Out"
  // Bookings where listing.owner_id == my user.id and status is active or similar
  // We need to fetch the renter profile to show who is currently using it
  const { data: currentlyRentedOut, error: rentedOutError } = await supabase
    .from("bookings")
    .select(`
      *,
      renter:profiles!renter_id(id, full_name, avatar_url, trust_score),
      listings!inner(id, title, category, owner_id)
    `)
    .eq("listings.owner_id", user.id)
    .in("status", ["pending", "active", "awaiting_payment"])
    .order("created_at", { ascending: false });

  if (rentedOutError) {
    console.error("Error fetching currently rented out:", rentedOutError.message);
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 pb-[60px] overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <DashboardClient
          myListings={myListings || []}
          currentlyRentedOut={currentlyRentedOut || []}
        />
      </div>
    </div>
  );
}
