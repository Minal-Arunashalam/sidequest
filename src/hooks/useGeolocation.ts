import { useState, useCallback } from 'react';
import type { GeoLocation } from '../types';

interface GeolocationState {
  location: GeoLocation | null;
  locationLabel: string;
  error: string | null;
  loading: boolean;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address ?? {};
    return (
      addr.neighbourhood ??
      addr.suburb ??
      addr.quarter ??
      addr.city_district ??
      addr.town ??
      addr.city ??
      addr.county ??
      'your area'
    );
  } catch {
    return 'your area';
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    locationLabel: '',
    error: null,
    loading: false,
  });

  const getLocation = useCallback((): Promise<{ location: GeoLocation; locationLabel: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by this browser.';
        setState((s) => ({ ...s, error: err, loading: false }));
        reject(new Error(err));
        return;
      }

      setState((s) => ({ ...s, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: GeoLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const locationLabel = await reverseGeocode(location.lat, location.lng);
          setState({ location, locationLabel, error: null, loading: false });
          resolve({ location, locationLabel });
        },
        (err) => {
          let message = 'Could not get your location.';
          if (err.code === err.PERMISSION_DENIED) {
            message = 'Location access denied. Please enable it in your browser settings.';
          } else if (err.code === err.TIMEOUT) {
            message = 'Location request timed out. Please try again.';
          }
          setState((s) => ({ ...s, error: message, loading: false }));
          reject(new Error(message));
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }, []);

  return { ...state, getLocation };
}
