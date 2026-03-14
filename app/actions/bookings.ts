"use server";

import { createClient } from "@/lib/supabase/server";
import type { NewBookingData } from "@/types";

export async function createBooking(data: NewBookingData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to make a booking." };
  }

  // Fetch the listing to calculate total price and validate ownership
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("price_per_day, owner_id, is_active")
    .eq("id", data.listing_id)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found." };
  }

  if (!listing.is_active) {
    return { error: "This listing is no longer available." };
  }

  if (listing.owner_id === user.id) {
    return { error: "You cannot book your own listing." };
  }

  // Calculate the number of days
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);

  if (end < start) {
    return { error: "End date must be after start date." };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msPerDay));
  const totalPrice = parseFloat((listing.price_per_day * numDays).toFixed(2));

  // Check for overlapping bookings on the same listing
  const { data: overlapping } = await supabase
    .from("bookings")
    .select("id")
    .eq("listing_id", data.listing_id)
    .neq("status", "cancelled")
    .lte("start_date", data.end_date)
    .gte("end_date", data.start_date);

  if (overlapping && overlapping.length > 0) {
    return { error: "This listing is already booked for the selected dates." };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      listing_id: data.listing_id,
      renter_id: user.id,
      start_date: data.start_date,
      end_date: data.end_date,
      total_price: totalPrice,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: booking, error: null };
}

export async function getUserBookings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*, listings(title, category, price_per_day)")
    .eq("renter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
