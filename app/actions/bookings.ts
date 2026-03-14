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

export async function processQRHandshake(bookingId: string, scannedQrId: string, evUsed: boolean = false) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // Fetch booking with listing details (using any to bypass unknown DB types schema)
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*, listings(qr_code_id, price_per_hour, ev_price_per_hour)")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { error: "Booking not found." };
  }

  // Verify the scanner is the renter
  if (booking.renter_id !== user.id) {
    return { error: "Unauthorized: Only the renter can check in." };
  }

  const listing: any = booking.listings;

  if (listing.qr_code_id !== scannedQrId) {
    return { error: "Invalid QR code scanned." };
  }

  const now = new Date().toISOString();

  if (!booking.actual_start_time) {
    // Check-in
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        actual_start_time: now,
        status: "active",
      })
      .eq("id", bookingId);

    if (updateError) {
      return { error: updateError.message };
    }

    return { data: { message: "Check-in successful", status: "active" }, error: null };
  } else if (!booking.actual_end_time) {
    // Check-out
    const startTime = new Date(booking.actual_start_time);
    const endTime = new Date(now);
    
    // Calculate total duration in hours (minimum 1 hour)
    const diffMs = endTime.getTime() - startTime.getTime();
    const durationHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    
    // Calculate price
    const baseRate = parseFloat(listing.price_per_hour || 0);
    const evRate = evUsed ? parseFloat(listing.ev_price_per_hour || 0) : 0;
    const hourlyRate = baseRate + evRate;
    
    // Fallback if price_per_hour is missing (e.g. standard booking without hourly setup)
    // For now we calculate exactly as instructed
    const calculatedPrice = durationHours * hourlyRate;
    
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        actual_end_time: now,
        total_price: calculatedPrice,
        status: "awaiting_payment",
      })
      .eq("id", bookingId);

    if (updateError) {
      return { error: updateError.message };
    }

    return { 
      data: { 
        message: "Check-out successful", 
        status: "awaiting_payment", 
        price: calculatedPrice 
      }, 
      error: null 
    };
  } else {
    return { error: "Booking is already completed." };
  }
}

export async function sendMessage(bookingId: string, text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("messages")
    .insert({
      booking_id: bookingId,
      sender_id: user.id,
      text: text,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data, error: null };
}

export async function completePayment(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", bookingId)
    .eq("status", "awaiting_payment");

  if (error) return { error: error.message };
  return { error: null };
}
