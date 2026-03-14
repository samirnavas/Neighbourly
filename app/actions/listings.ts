"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { NewListingData } from "@/types";

export async function createListing(data: NewListingData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a listing." };
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      title: data.title,
      description: data.description,
      category: data.category,
      price_per_day: data.price_per_day,
      latitude: data.latitude,
      longitude: data.longitude,
      has_ev_charging: data.has_ev_charging,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(`/listings/${listing.id}`);
}

export async function getActiveListings(category?: 'space' | 'tool') {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*, owner:profiles!owner_id(full_name, trust_score, avatar_url)")
    .eq("is_active", true);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getListingById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, profiles(full_name, avatar_url)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
