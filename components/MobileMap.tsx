"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false });

export function MobileMap({
    listingType,
    initialListings,
}: {
    listingType: "space" | "tool";
    initialListings: Record<string, unknown>[];
}) {
    return <MapInner listingType={listingType} initialListings={initialListings as import("./MapInner").MapListing[]} />;
}
