import { MobileMap } from "@/components/MobileMap";

export default function ExploreSpacesPage() {
    return (
        <div className="relative w-full h-[100dvh]">
            <MobileMap listingType="space" />
        </div>
    );
}
