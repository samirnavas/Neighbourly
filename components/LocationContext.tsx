"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        isLoading: false,
      }));
      return;
    }

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
        setLocation((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // Increased timeout to 10s as mobile GPS can be slow
        maximumAge: 0,
      }
    );
  }, []);

  return (
    <LocationContext.Provider value={location}>
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
