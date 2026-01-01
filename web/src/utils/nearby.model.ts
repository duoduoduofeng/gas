import { getStations } from "../services/api";
import { toNearbyStations } from "./viewmodel";
import type { NearbyStationVM } from "./viewmodel";
import { toErrorMessage } from "./format";
import type { LocationResult } from "./location";
import {
  getPreferredLocation,
  getCurrentLocation,
  chooseLocation,
  saveSelectedLocation,
  clearSelectedLocation,
} from "./location";


export type NearbyStatePatch = Partial<{
  lat: number;
  lng: number;
  stations: NearbyStationVM[];
  locationStatus: "loading" | "ready" | "denied";
  locationSource: string;
  locationName: string;
  error: string;
}>;

async function buildState({ loc, radius }: { loc: LocationResult; radius: number }): Promise<NearbyStatePatch> {
  const raw = await getStations({ lat: loc.lat, lng: loc.lng, radius });
  return {
    lat: loc.lat,
    lng: loc.lng,
    stations: toNearbyStations(raw),
    locationStatus: "ready",
    locationSource: loc.source || "",
    locationName: loc.name || "",
    error: "",
  };
}

export async function initNearby({ radius }: { radius: number }): Promise<NearbyStatePatch> {
  try {
    const loc = await getPreferredLocation();
    return await buildState({ loc, radius });
  } catch (err: any) {
    return {
      stations: [],
      locationStatus: "denied",
      error: toErrorMessage(err),
    };
  }
}

export async function refreshNearby({ lat, lng, radius }: { lat: number; lng: number; radius: number }): Promise<NearbyStatePatch> {
  try {
    const raw = await getStations({ lat, lng, radius });
    return {
      stations: toNearbyStations(raw),
      error: "",
    };
  } catch (err: any) {
    return { error: toErrorMessage(err) };
  }
}

export async function useMyLocation({ radius }: { radius: number }): Promise<NearbyStatePatch> {
  try {
    clearSelectedLocation();
    const loc = await getCurrentLocation();
    return await buildState({ loc, radius });
  } catch (err: any) {
    return { error: toErrorMessage(err) };
  }
}

export async function pickLocation({ radius }: { radius: number }): Promise<NearbyStatePatch> {
  try {
    const loc = await chooseLocation();
    saveSelectedLocation(loc);
    return await buildState({ loc, radius });
  } catch (err: any) {
    return { error: toErrorMessage(err) };
  }
}