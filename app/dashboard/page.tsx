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
  // renter_id → auth.users (no direct FK to profiles), so we join profiles manually
  const { data: currentlyRentedOut, error: rentedOutError } = await supabase
    .from("bookings")
    .select(`
      *,
      listings!inner(id, title, category, owner_id)
    `)
    .eq("listings.owner_id", user.id)
    .in("status", ["pending", "active", "awaiting_payment"])
    .order("created_at", { ascending: false });

  if (rentedOutError) {
    console.error("Error fetching currently rented out:", rentedOutError.message);
  }

  // Fetch renter profiles separately
  const renterIds = [...new Set((currentlyRentedOut ?? []).map((b: any) => b.renter_id).filter(Boolean))];
  const { data: renterProfiles } = renterIds.length
    ? await supabase.from("profiles").select("id, full_name, avatar_url, trust_score").in("id", renterIds)
    : { data: [] };

  const renterMap = Object.fromEntries((renterProfiles ?? []).map((p: any) => [p.id, p]));

  const rentedOutWithRenter = (currentlyRentedOut ?? []).map((b: any) => ({
    ...b,
    renter: renterMap[b.renter_id] ?? null,
  }));

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 pb-[60px] overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <DashboardClient
          myListings={myListings || []}
          currentlyRentedOut={rentedOutWithRenter}
        />
      </div>
    </div>
  );
}
