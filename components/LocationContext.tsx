"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

interface LocationContextType extends LocationData {
  requestLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        isLoading: false,
      }));
      return;
    }

    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      setLocation((prev) => ({
        ...prev,
        error: "Location requires a secure connection (HTTPS) when accessed over a local network.",
        isLoading: false,
      }));
      return;
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        let errorMsg = "Unable to retrieve your location";
        if (error.code === 1) errorMsg = "Location permission denied";
        else if (error.code === 2) errorMsg = "Location position unavailable";
        else if (error.code === 3) errorMsg = "Location request timed out";

        setLocation((prev) => ({
          ...prev,
          error: errorMsg,
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ ...location, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
