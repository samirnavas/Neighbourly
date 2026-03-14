"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false });

export function MobileMap({ listingType }: { listingType: "space" | "tool" }) {
    return <MapInner listingType={listingType} />;
}
