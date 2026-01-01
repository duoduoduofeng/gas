import { useEffect, useMemo, useState } from "react";
import APP_CONFIG from "../config/app.config";
import { initNearby, refreshNearby, useMyLocation, pickLocation } from "../utils/nearby.model";
import type { NearbyStationVM } from "../utils/viewmodel";
import NearbyView from "./NearbyView";
import "./nearby.css";

function isNumber(n: unknown): n is number {
  return typeof n === "number" && !Number.isNaN(n);
}

export default function NearbyPage() {
  const radiusOptionsKm = APP_CONFIG.nearby.radiusOptionsKm;

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(APP_CONFIG.api.defaults.radiusKm);

  const [stations, setStations] = useState<NearbyStationVM[]>([]);
  const [locationStatus, setLocationStatus] = useState<"loading" | "ready" | "denied">("loading");
  const [locationSource, setLocationSource] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locationCoordText = useMemo(() => {
    if (isNumber(lat) && isNumber(lng)) return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
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

  function applyState(patch: any, opts?: { devHintOnDenied?: boolean }) {
    const devHintOnDenied = !!opts?.devHintOnDenied;
    const next: any = { ...patch };

    if (devHintOnDenied && next.locationStatus === "denied" && typeof next.error === "string" && next.error) {
      next.error = `${next.error} (Tip: allow browser location, or use "Choose location".)`;
    }

    if (typeof next.lat === "number") setLat(next.lat);
    if (typeof next.lng === "number") setLng(next.lng);
    if (Array.isArray(next.stations)) setStations(next.stations);
    if (typeof next.locationStatus === "string") setLocationStatus(next.locationStatus);
    if (typeof next.locationSource === "string") setLocationSource(next.locationSource);
    if (typeof next.locationName === "string") setLocationName(next.locationName);
    if (typeof next.error === "string") setError(next.error);
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

  useEffect(() => {
    runWithLoading(async () => {
      const state = await initNearby({ radius });
      applyState(state, { devHintOnDenied: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRadiusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const index = Number(e.target.value);
    const nextRadius = radiusOptionsKm[index];

    await runWithLoading(async () => {
      setRadius(nextRadius);

      if (!isNumber(lat) || !isNumber(lng)) {
        const state = await initNearby({ radius: nextRadius });
        applyState(state, { devHintOnDenied: true });
        return;
      }

      const state = await refreshNearby({ lat, lng, radius: nextRadius });
      applyState(state);
    });
  }

  async function onUseMyLocation() {
    await runWithLoading(async () => {
      const state = await useMyLocation({ radius });
      applyState(state, { devHintOnDenied: true });
    });
  }

  async function onChooseLocation() {
    await runWithLoading(async () => {
      const state = await pickLocation({ radius });
      applyState(state);
    });
  }

  async function onRefresh() {
    await runWithLoading(async () => {
      if (!isNumber(lat) || !isNumber(lng)) {
        const state = await initNearby({ radius });
        applyState(state, { devHintOnDenied: true });
        return;
      }

      const state = await refreshNearby({ lat, lng, radius });
      applyState(state);
    });
  }

  return (
    <NearbyView
      radius={radius}
      radiusOptionsKm={radiusOptionsKm}
      stations={stations}
      locationStatus={locationStatus}
      locationSource={locationSource}
      locationName={locationName}
      locationCoordText={locationCoordText}
      loading={loading}
      error={error}
      onRadiusChange={onRadiusChange}
      onRefresh={onRefresh}
      onUseMyLocation={onUseMyLocation}
      onChooseLocation={onChooseLocation}
      onOpenStation={openStation}
    />
  );
}