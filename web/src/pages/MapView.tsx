import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngLiteral } from "leaflet";

import type { NearbyStationVM } from "../utils/viewmodel";
import type { LocationResult } from "../utils/location";
import { choosingMarkerIcon, stationMarkerIcon } from "../utils/leaflet.icon";

type Props = {
  radius: number;
  radiusOptionsKm: number[];

  stations: NearbyStationVM[];
  locationStatus: "loading" | "ready" | "denied";
  locationSource: string;
  locationName: string;
  locationCoordText: string;

  pendingLoc: LocationResult | null;

  loading: boolean;
  error: string;

  onRadiusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRefresh: () => void;
  onUseMyLocation: () => void;
  onClearPicked: () => void;

  onOpenStation: (id: number) => void;
  onPickOnMap: (loc: LocationResult) => void;

  onConfirmPick: () => void;
  onCancelPick: () => void;
};

function PickOnMap(props: { onPick: (loc: LocationResult) => void }) {
  useMapEvents({
    click(e) {
      props.onPick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        source: "picked",
        name: "",
      });
    },
  });
  return null;
}

/**
 * Render-only function.
 * All JSX for Map page lives here to keep MapPage logic clean.
 */
function renderMapView(props: Props) {
  const {
    radius,
    radiusOptionsKm,
    stations,
    locationStatus,
    locationSource,
    locationName,
    locationCoordText,
    pendingLoc,
    loading,
    error,
    onRadiusChange,
    onRefresh,
    onUseMyLocation,
    onClearPicked,
    onOpenStation,
    onPickOnMap,
    onConfirmPick,
    onCancelPick,
  } = props;

  const coordText = pendingLoc
  ? `${pendingLoc.lat.toFixed(5)}, ${pendingLoc.lng.toFixed(5)}`
  : locationCoordText;

  const locationPrefix = pendingLoc
  ? "Choosing"
  : locationSource === "picked"
  ? "Chosen"
  : "Current";

  const center: LatLngLiteral = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    const qLat = Number(sp.get("lat"));
    const qLng = Number(sp.get("lng"));

    if (Number.isFinite(qLat) && Number.isFinite(qLng)) {
      return { lat: qLat, lng: qLng };
    }

    return { lat: 49.17, lng: -123.13 };
  }, []);

  return (
    <div className="page mapPage">
      <div className="header">
        <div className="title">Map</div>

        <div className="controls">
          <select className="pillSelect" value={String(radiusOptionsKm.indexOf(radius))} onChange={onRadiusChange}>
            {radiusOptionsKm.map((v, i) => (
              <option key={v} value={String(i)}>
                Radius: {v} km
              </option>
            ))}
          </select>

          <button className="refreshWrap" onClick={onRefresh} aria-label="refresh">
            <div className="refreshBtn">↻</div>
          </button>
        </div>
      </div>

      <div className="locationBar">
        <div className="locationInfo">
          <div className="locationLabel">Location</div>

          {locationStatus === "ready" ? (
            <div className="locationValue">
              <span>{locationPrefix}</span>
              <span>{locationName ? ` · ${locationName}` : ` · ${coordText}`}</span>
            </div>
          ) : locationStatus === "loading" ? (
            <div className="locationValue muted">Getting location...</div>
          ) : (
            <div className="locationValue muted">Location unavailable</div>
          )}
        </div>

        <div className="locationActions">
          <button className="actionBtn" onClick={onUseMyLocation}>
            Use my location
          </button>
          <button className="actionBtn primary" onClick={onClearPicked}>
            Clear chosen
          </button>
        </div>

        <div className="confirmBar">
          <button className="actionBtn" onClick={onCancelPick}>
            Cancel
          </button>
          <button className="actionBtn primary" onClick={onConfirmPick} disabled={!pendingLoc}>
            Confirm
          </button>
        </div>
      </div>

      {loading && <div className="state">Loading...</div>}
      {!!error && <div className="state error">{error}</div>}

      <div className="mapWrap">
        <MapContainer center={center} zoom={14} className="leafletMap">
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <PickOnMap onPick={onPickOnMap} />

          {/* Pending selected location marker */}
          {pendingLoc && (
            <Marker position={{ lat: pendingLoc.lat, lng: pendingLoc.lng }} icon={choosingMarkerIcon}>
              <Popup>
                <div className="popup">
                  <div className="popupTitle">Selected point</div>
                  <div className="popupRow">
                    {pendingLoc.lat.toFixed(5)}, {pendingLoc.lng.toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Station markers */}
          {stations
            .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
            .map((s) => (
              <Marker key={s.id} position={{ lat: s.lat as number, lng: s.lng as number }} icon={stationMarkerIcon}>
                <Popup>
                  <div className="popup">
                    <div className="popupTitle">{s.name}</div>
                    <div className="popupRow">Price: {s.currentPriceText}</div>
                    <div className="popupRow">Confidence: {s.confidence}</div>
                    <div className="popupRow">Reports: {s.reportCount}</div>
                    <div className="popupRow">Updated: {s.lastUpdatedText}</div>
                    <button className="popupBtn" onClick={() => onOpenStation(s.id)}>
                      Open
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {!loading && !error && (
        <div className="listWrap">
          {stations.length === 0 && <div className="state">No stations</div>}

          {stations.map((item) => (
            <div
              key={item.id}
              className="card clickable"
              onClick={() => onOpenStation(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpenStation(item.id);
              }}
            >
              <div className="cardTop">
                <div className="name">{item.name}</div>
                <div className={`badge ${item.confidence}`}>{item.confidence}</div>
              </div>

              <div className="metrics">
                <div className="metric">
                  <div className="k">Price</div>
                  <div className="v price">{item.currentPriceText}</div>
                </div>

                <div className="metric">
                  <div className="k">Reports</div>
                  <div className="v">{item.reportCount}</div>
                </div>

                <div className="metric">
                  <div className="k">Updated</div>
                  <div className="v">{item.lastUpdatedText}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MapView(props: Props) {
  return renderMapView(props);
}