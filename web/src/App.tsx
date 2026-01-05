import { useEffect, useState } from "react";
import NearbyPage from "./pages/NearbyPage";
import StationPage from "./pages/StationPage";
import ReportPage from "./pages/ReportPage";
import MapPage from "./pages/MapPage";

function getPage(): string {
  const sp = new URLSearchParams(window.location.search);
  return sp.get("page") || "nearby";
}

export default function App() {
  const [page, setPage] = useState(getPage());

  useEffect(() => {
    const onPop = () => setPage(getPage());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div className="appShell">
      {page === "map" ? (
        <MapPage />
      ) : page === "station" ? (
        <StationPage />
      ) : page === "report" ? (
        <ReportPage />
      ) : (
        <NearbyPage />
      )}
    </div>
  );
}