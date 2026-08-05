import "server-only";
import { nairaToKobo } from "./slugify";

// Reference point for distance calculations — set this to your actual
// warehouse/dispatch location. Currently set to Ikeja, Lagos as a placeholder.
const ORIGIN = { lat: 6.5244, lng: 3.3792 };

const LAGOS_FLAT_FEE_NAIRA = 4000;
const OUTSIDE_BASE_FEE_NAIRA = 8000;
const FREE_RADIUS_KM = 50; // distance beyond Lagos already covered by the base fee
const PER_KM_RATE_NAIRA = 50; // charged per km past the free radius

export type ShippingEstimate = {
  feeKobo: number;
  feeNaira: number;
  zone: "lagos" | "outside_lagos";
  distanceKm: number | null;
  note?: string;
};

type AddressInput = {
  line1: string;
  city: string;
  state: string;
  country: string;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Free OpenStreetMap geocoder — no API key required. Suitable for
 * low/moderate checkout volume; Nominatim's usage policy caps this at
 * ~1 request/sec and isn't meant for heavy commercial traffic. To switch to
 * Google Maps' Geocoding API later, just replace this function's body —
 * the return shape ({ lat, lng } | null) is all that needs to stay the same.
 */
async function geocodeAddress(address: AddressInput): Promise<{ lat: number; lng: number } | null> {
  const query = `${address.line1}, ${address.city}, ${address.state}, ${address.country}`;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ng&q=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          // Nominatim requires a real identifying User-Agent per its usage
          // policy — swap in your actual contact email before going live.
          "User-Agent": "ElgeeCosmetics/1.0 (support@elgeecosmetics.com)",
        },
        signal: AbortSignal.timeout(5000), // don't let a slow geocode stall checkout
      }
    );
    if (!res.ok) return null;

    const results = (await res.json()) as { lat: string; lon: string }[];
    if (!results.length) return null;

    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

export async function calculateShippingFee(address: AddressInput): Promise<ShippingEstimate> {
  const isLagos =
    address.state.trim().toLowerCase() === "lagos" &&
    address.country.trim().toLowerCase().includes("nigeria");

  if (isLagos) {
    return {
      feeKobo: nairaToKobo(LAGOS_FLAT_FEE_NAIRA),
      feeNaira: LAGOS_FLAT_FEE_NAIRA,
      zone: "lagos",
      distanceKm: null,
    };
  }

  const coords = await geocodeAddress(address);

  if (!coords) {
    // Can't determine distance — charge the safe base rate rather than
    // guess, and flag why so it's visible in an order review if needed.
    return {
      feeKobo: nairaToKobo(OUTSIDE_BASE_FEE_NAIRA),
      feeNaira: OUTSIDE_BASE_FEE_NAIRA,
      zone: "outside_lagos",
      distanceKm: null,
      note: "Couldn't geocode this address — base rate applied with no distance surcharge.",
    };
  }

  const distanceKm = haversineKm(ORIGIN.lat, ORIGIN.lng, coords.lat, coords.lng);
  const extraKm = Math.max(0, distanceKm - FREE_RADIUS_KM);
  const fee =
    OUTSIDE_BASE_FEE_NAIRA + Math.round((extraKm * PER_KM_RATE_NAIRA) / 100) * 100;

  return {
    feeKobo: nairaToKobo(fee),
    feeNaira: fee,
    zone: "outside_lagos",
    distanceKm: Math.round(distanceKm),
  };
}