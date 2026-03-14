"use client";

import { useEffect, useState, useMemo } from "react";
import { MobileMap } from "@/components/MobileMap";
import { getActiveListings } from "@/app/actions/listings";
import { useLocation } from "@/components/LocationContext";
import { getDistance } from "@/lib/utils";

export default function ExploreSpacesPage() {
    const [listings, setListings] = useState<Record<string, unknown>[]>([]);
    const { latitude, longitude } = useLocation();

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

    const filteredListings = useMemo(() => {
        if (!latitude || !longitude) return listings;
        return listings.filter((item) => {
            const itemLat = item.latitude as number | undefined;
            const itemLng = item.longitude as number | undefined;
            if (itemLat === undefined || itemLng === undefined) return false;
            const dist = getDistance(latitude, longitude, itemLat, itemLng);
            return dist <= 25; // 25km radius
        });
    }, [listings, latitude, longitude]);

    return (
        <div className="relative w-full h-[100dvh]">
            <MobileMap listingType="space" initialListings={filteredListings} />
        </div>
    );
}
