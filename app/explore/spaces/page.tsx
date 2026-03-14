import { MobileMap } from "@/components/MobileMap";

export default function ExploreSpacesPage() {
    return (
        <div className="relative w-full h-full">
            <MobileMap listingType="space" />
        </div>
    );
}
