"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ListingCategory } from "@/types";

export default function NewListingPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ListingCategory>("space");
  const [pricePerDay, setPricePerDay] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login?redirectTo=/listings/new");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const price = parseFloat(pricePerDay);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("Please enter a valid latitude between -90 and 90.");
      setLoading(false);
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError("Please enter a valid longitude between -180 and 180.");
      setLoading(false);
      return;
    }

    if (isNaN(price) || price < 0) {
      setError("Please enter a valid price.");
      setLoading(false);
      return;
    }

    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        owner_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        price_per_day: price,
        latitude: lat,
        longitude: lng,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/listings/${listing.id}`);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      () => {
        setError("Unable to retrieve your location. Please enter it manually.");
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add a New Listing</CardTitle>
          <CardDescription>
            Share your driveway or tool with your neighbours and start earning.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ListingCategory)}
                required
              >
                <option value="space">🅿️ Parking Space</option>
                <option value="tool">🔧 Tool / Equipment</option>
              </Select>
              <p className="text-xs text-gray-400">
                Select whether you&apos;re listing a parking space or a tool.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder={
                  category === "space"
                    ? "e.g. Covered garage spot near city centre"
                    : "e.g. Bosch cordless drill with bits"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Add any extra details, access instructions, or condition notes…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price_per_day">Price per Day (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <Input
                  id="price_per_day"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  required
                  className="pl-7"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Location (Coordinates)</Label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-xs text-emerald-600 hover:underline font-medium"
                >
                  📍 Use my current location
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="latitude" className="text-xs text-gray-500">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    placeholder="e.g. 40.7128"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="longitude" className="text-xs text-gray-500">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    placeholder="e.g. -74.0060"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                You can find your coordinates using Google Maps — right-click on
                your location and select &quot;What&apos;s here?&quot;
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Publishing listing…" : "Publish Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
