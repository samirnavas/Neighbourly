"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Listing } from "@/types";

interface BookingFormProps {
  listing: Listing;
}

export default function BookingForm({ listing }: BookingFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const calcDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const ms = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  const totalPrice = calcDays() * listing.price_per_day;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to book. Please sign in first.");
      setLoading(false);
      return;
    }

    if (user.id === listing.owner_id) {
      setError("You cannot book your own listing.");
      setLoading(false);
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be on or after start date.");
      setLoading(false);
      return;
    }

    // Check for overlapping bookings
    const { data: overlapping } = await supabase
      .from("bookings")
      .select("id")
      .eq("listing_id", listing.id)
      .neq("status", "cancelled")
      .lte("start_date", endDate)
      .gte("end_date", startDate);

    if (overlapping && overlapping.length > 0) {
      setError("This listing is already booked for the selected dates. Please choose different dates.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("bookings").insert({
      listing_id: listing.id,
      renter_id: user.id,
      start_date: startDate,
      end_date: endDate,
      total_price: parseFloat(totalPrice.toFixed(2)),
      status: "pending",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(
      `Booking confirmed for ${calcDays()} day${calcDays() > 1 ? "s" : ""} — total $${totalPrice.toFixed(2)}. The owner will be in touch soon!`
    );
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Book this {listing.category === "space" ? "space" : "tool"}
      </h2>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-4 rounded-lg text-sm">
          ✅ {success}
        </div>
      ) : (
        <form onSubmit={handleBook} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {/* Price summary */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>
                ${listing.price_per_day.toFixed(2)} × {calcDays()} day
                {calcDays() > 1 ? "s" : ""}
              </span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
              <span>Total</span>
              <span className="text-emerald-600">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing…" : "Request Booking"}
          </Button>
          <p className="text-xs text-gray-400 text-center">
            You won&apos;t be charged until the owner confirms.
          </p>
        </form>
      )}
    </div>
  );
}
