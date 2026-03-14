"use server";

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          // Nominatim strictly requires a custom User-Agent identifying your application
          "User-Agent": "NeighbourlyApp/1.0 (contact@neighbourly.local)",
          "Accept-Language": "en"
        },
        // Cache configuration (optional, helps avoid hitting rate limits)
        next: { revalidate: 3600 } 
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // You can customize how you want to format the returned address here
    return data.display_name || "Address not found";
    
  } catch (error) {
    console.error("Geocoding Error:", error);
    return "Location selected (Address formatting unavailable)";
  }
}
