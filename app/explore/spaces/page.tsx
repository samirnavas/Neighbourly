"use client";

import { useEffect, useState } from "react";
import { MobileMap } from "@/components/MobileMap";
import { getActiveListings } from "@/app/actions/listings";

export default function ExploreSpacesPage() {
    const [listings, setListings] = useState<Record<string, unknown>[]>([]);

    useEffect(() => {
        async function fetchListings() {
            const { data, error } = await getActiveListings("space");
            if (data && !error) {
                // listings returned already have 'owner' nested properly
                setListings(data);
            }
        }
        fetchListings();
    }, []);

    return (
        <div className="relative w-full h-[100dvh]">
            <MobileMap listingType="space" initialListings={listings} />
        </div>
    );
}
