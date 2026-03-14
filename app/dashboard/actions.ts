"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFullListing(formData: FormData) {
  const supabase = await createClient();

  // Ensure user is auth'd
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a listing." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as "space" | "tool";
  const address_text = formData.get("address_text") as string;
  const price_per_hour = parseFloat(formData.get("price_per_hour") as string);
  
  // Hardcode coordinates or fetch from map API later
  const latitude = 0;
  const longitude = 0;

  // Space extra fields
  let ev_charging_available = false;
  let ev_price_per_hour = 0;
  
  if (category === "space") {
    ev_charging_available = formData.get("ev_charging_available") === "on";
    if (ev_charging_available) {
      ev_price_per_hour = parseFloat(formData.get("ev_price_per_hour") as string) || 0;
    }
  }

  // Handle mock image url for now
  const image_url = "https://images.unsplash.com/photo-1542338106-fa7098e988cf?q=80&w=2674&auto=format&fit=crop";

  const { data, error } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      title,
      description,
      category,
      address_text,
      price_per_hour,
      // price_per_day fallback based on 24h as per previous type rules or just default
      price_per_day: price_per_hour * 8, 
      latitude,
      longitude,
      ev_charging_available,
      ev_price_per_hour,
      image_url,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { data, error: null };
}
