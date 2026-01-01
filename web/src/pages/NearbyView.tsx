import type { NearbyStationVM } from "../utils/viewmodel";
// import "./nearby.css";

type Props = {
  radius: number;
  radiusOptionsKm: number[];

  stations: NearbyStationVM[];
  locationStatus: "loading" | "ready" | "denied";
  locationSource: string;
  locationName: string;
  locationCoordText: string;

  loading: boolean;
  error: string;

  onRadiusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRefresh: () => void;
  onUseMyLocation: () => void;
  onChooseLocation: () => void;
  onOpenStation: (id: number) => void;
};

export default function NearbyView(props: Props) {
  const {
    radius,
    radiusOptionsKm,
    stations,
    locationStatus,
    locationSource,
    locationName,
    locationCoordText,
    loading,
    error,
    onRadiusChange,
    onRefresh,
    onUseMyLocation,
    onChooseLocation,
    onOpenStation,
  } = props;

  return (
    <div className="page">
      <div className="header">
        <div className="title">Nearby</div>

        <div className="controls">
          <select
            className="pillSelect"
            value={String(radiusOptionsKm.indexOf(radius))}
            onChange={onRadiusChange}
          >
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
              <span>{locationSource === "picked" ? "Chosen" : "Current"}</span>
              <span>{locationName ? ` · ${locationName}` : ` · ${locationCoordText}`}</span>
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
          <button className="actionBtn primary" onClick={onChooseLocation}>
            Choose location
          </button>
        </div>
      </div>

      {loading && <div className="state">Loading...</div>}
      {!!error && <div className="state error">{error}</div>}

      {!loading && !error && (
        <>
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
        </>
      )}
    </div>
  );
}