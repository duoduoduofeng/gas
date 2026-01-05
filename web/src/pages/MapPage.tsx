// web/src/pages/MapPage.tsx (OVERWRITE)
import { useEffect, useMemo, useState } from "react";
import APP_CONFIG from "../config/app.config";
import type { NearbyStationVM } from "../utils/viewmodel";
import type { LocationResult } from "../utils/location";
import { initMap, refreshMap, useMyLocation, clearPicked, pickOnMap } from "../utils/map.model";
import MapView from "./MapView";
import "./map.css";

function isNumber(n: unknown): n is number {
  return typeof n === "number" && !Number.isNaN(n);
}

export default function MapPage() {
  const radiusOptionsKm = APP_CONFIG.nearby.radiusOptionsKm;

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(APP_CONFIG.api.defaults.radiusKm);

  const [stations, setStations] = useState<NearbyStationVM[]>([]);
  const [locationStatus, setLocationStatus] = useState<"loading" | "ready" | "denied">("loading");
  const [locationSource, setLocationSource] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");

  const [pendingLoc, setPendingLoc] = useState<LocationResult | null>(null);
  const [initialPendingLoc, setInitialPendingLoc] = useState<LocationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locationCoordText = useMemo(() => {
    if (isNumber(lat) && isNumber(lng)) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    return "";
  }, [lat, lng]);

  async function runWithLoading(fn: () => Promise<void>) {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  }

  function applyState(patch: any) {
    const hasLat = typeof patch.lat === "number";
    const hasLng = typeof patch.lng === "number";

    if (hasLat) setLat(patch.lat);
    if (hasLng) setLng(patch.lng);

    if (Array.isArray(patch.stations)) setStations(patch.stations);
    if (typeof patch.locationStatus === "string") setLocationStatus(patch.locationStatus);
    if (typeof patch.locationSource === "string") setLocationSource(patch.locationSource);
    if (typeof patch.locationName === "string") setLocationName(patch.locationName);
    if (typeof patch.error === "string") setError(patch.error);

    // Initialize pending marker once using current preferred location
    if (!pendingLoc && hasLat && hasLng) {
      const base = { lat: patch.lat, lng: patch.lng, source: "picked" as const, name: "" };
      setPendingLoc(base);
      if (!initialPendingLoc) setInitialPendingLoc(base);
    }
  }

  function openStation(id: number) {
    const sp = new URLSearchParams(window.location.search);
    sp.set("page", "station");
    sp.set("id", String(id));

    if (isNumber(lat) && isNumber(lng)) {
      sp.set("lat", String(lat));
      sp.set("lng", String(lng));
    }

    window.history.pushState({}, "", `${window.location.pathname}?${sp.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function goNearby() {
    const sp = new URLSearchParams(window.location.search);
    sp.set("page", "nearby");
    sp.delete("lat");
    sp.delete("lng");
    window.history.pushState({}, "", `${window.location.pathname}?${sp.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  useEffect(() => {
    runWithLoading(async () => {
      const state = await initMap({ radius });
      applyState(state);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRadiusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const index = Number(e.target.value);
    const nextRadius = radiusOptionsKm[index];

    await runWithLoading(async () => {
      setRadius(nextRadius);

      if (!isNumber(lat) || !isNumber(lng)) {
        const state = await initMap({ radius: nextRadius });
        applyState(state);
        return;
      }

      const state = await refreshMap({ lat, lng, radius: nextRadius });
      applyState(state);
    });
  }

  async function onRefresh() {
    await runWithLoading(async () => {
      if (!isNumber(lat) || !isNumber(lng)) {
        const state = await initMap({ radius });
        applyState(state);
        return;
      }

      const state = await refreshMap({ lat, lng, radius });
      applyState(state);
    });
  }

  async function onUseMyLocation() {
    await runWithLoading(async () => {
      const state = await useMyLocation({ radius });
      applyState(state);
      // Move pending marker to the new center
      if (typeof state.lat === "number" && typeof state.lng === "number") {
        setPendingLoc({ lat: state.lat, lng: state.lng, source: "picked", name: "" });
      }
    });
  }

  async function onClearPicked() {
    await runWithLoading(async () => {
      const state = await clearPicked({ radius });
      applyState(state);
      // Move pending marker to the new center
      if (typeof state.lat === "number" && typeof state.lng === "number") {
        setPendingLoc({ lat: state.lat, lng: state.lng, source: "picked", name: "" });
      }
    });
  }

  function onPickOnMap(loc: LocationResult) {
    // Only move marker; do not persist or navigate
    setPendingLoc(loc);
  }

  async function onConfirmPick() {
    if (!pendingLoc) return;

    await runWithLoading(async () => {
      const state = await pickOnMap({ loc: pendingLoc, radius });
      applyState(state);
      goNearby();
    });
  }

  async function onCancelPick() {
    // Revert marker to the original state before leaving
    if (initialPendingLoc) setPendingLoc(initialPendingLoc);
    goNearby();
  }

  return (
    <MapView
      radius={radius}
      radiusOptionsKm={radiusOptionsKm}
      stations={stations}
      locationStatus={locationStatus}
      locationSource={locationSource}
      locationName={locationName}
      locationCoordText={locationCoordText}
      pendingLoc={pendingLoc}
      loading={loading}
      error={error}
      onRadiusChange={onRadiusChange}
      onRefresh={onRefresh}
      onUseMyLocation={onUseMyLocation}
      onClearPicked={onClearPicked}
      onOpenStation={openStation}
      onPickOnMap={onPickOnMap}
      onConfirmPick={onConfirmPick}
      onCancelPick={onCancelPick}
    />
  );
}