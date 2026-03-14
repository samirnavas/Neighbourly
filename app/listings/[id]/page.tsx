import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import type { Listing } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*, profiles(full_name)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !listing) {
    notFound();
  }

  const typedListing = listing as Listing & { profiles: { full_name: string | null } };
  const isSpace = typedListing.category === "space";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link
          href="/explore"
          className="text-sm text-emerald-600 hover:underline"
        >
          ← Back to map
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
              isSpace
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isSpace ? "🅿️ Parking Space" : "🔧 Tool / Equipment"}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {typedListing.title}
          </h1>

          {typedListing.description && (
            <p className="text-gray-600 leading-relaxed">
              {typedListing.description}
            </p>
          )}

          {/* Details grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Price
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                ${typedListing.price_per_day.toFixed(2)}
                <span className="text-base font-normal text-gray-400">
                  /day
                </span>
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Location
              </p>
              <p className="text-sm text-gray-700">
                {typedListing.latitude.toFixed(4)},{" "}
                {typedListing.longitude.toFixed(4)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${typedListing.latitude},${typedListing.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:underline mt-1 inline-block"
              >
                View on Google Maps →
              </a>
            </div>
          </div>

          {/* Owner info */}
          {typedListing.profiles?.full_name && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                {typedListing.profiles.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Listed by
                </p>
                <p className="font-medium text-gray-800">
                  {typedListing.profiles.full_name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingForm listing={typedListing} />
          </div>
        </div>
      </div>
    </div>
  );
}
