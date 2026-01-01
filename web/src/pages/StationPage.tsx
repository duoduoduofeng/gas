import { useEffect, useMemo, useState } from "react";
import { getStationDetail } from "../services/api";
import { toErrorMessage } from "../utils/format";
import APP_CONFIG from "../config/app.config";
import { toStationHeader, toRecentReports } from "../utils/viewmodel";
import type { StationHeaderVM, RecentReportVM } from "../utils/viewmodel";
import StationView from "./StationView";
import "./station.css";

function buildDefaultHeader(): StationHeaderVM {
  return {
    name: "",
    badge: "NONE",
    currentPriceText: APP_CONFIG.price.placeholder,
    reportCount: 0,
    lastUpdatedText: APP_CONFIG.price.placeholder,
  };
}

function getQueryNumber(name: string): number | null {
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get(name);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function StationPage() {
  const stationId = useMemo(() => getQueryNumber("id"), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [header, setHeader] = useState<StationHeaderVM>(buildDefaultHeader());
  const [reports, setReports] = useState<RecentReportVM[]>([]);

  async function loadDetail() {
    if (!stationId) {
      setError("Missing stationId.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const raw = await getStationDetail(stationId);

      setCurrentPrice(typeof raw?.currentPrice === "number" ? raw.currentPrice : null);
      setHeader(toStationHeader(raw));
      setReports(toRecentReports(raw));

      document.title = raw?.name || "Station";
    } catch (err: any) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    const sp = new URLSearchParams(window.location.search);
    sp.set("page", "nearby");
    sp.delete("id");
    window.history.pushState({}, "", `${window.location.pathname}?${sp.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function goReport() {
    if (!stationId) return;

    const sp = new URLSearchParams(window.location.search);
    sp.set("page", "report");
    sp.set("stationId", String(stationId));

    if (typeof currentPrice === "number") {
      sp.set("price", String(currentPrice));
    } else {
      sp.delete("price");
    }

    window.history.pushState({}, "", `${window.location.pathname}?${sp.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StationView
      header={header}
      reports={reports}
      loading={loading}
      error={error}
      onBack={goBack}
      onGoReport={goReport}
      onRefresh={loadDetail}
    />
  );
}