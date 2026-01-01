import { useEffect, useMemo, useState } from "react";
import APP_CONFIG from "../config/app.config";
import { validateReport } from "../utils/validators";
import { submitReport, mapReportError } from "../utils/report.service";
import ReportView from "./ReportView";
import "./report.css";

function getQueryNumber(name: string): number | null {
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get(name);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function setPage(params: Record<string, string | null>) {
  const sp = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(params)) {
    if (v === null) sp.delete(k);
    else sp.set(k, v);
  }
  window.history.pushState({}, "", `${window.location.pathname}?${sp.toString()}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function ReportPage() {
  const stationId = useMemo(() => getQueryNumber("stationId"), []);
  const qPrice = useMemo(() => getQueryNumber("price"), []);

  const initialPrice =
    Number.isFinite(qPrice ?? NaN)
      ? (qPrice as number)
      : APP_CONFIG.report.defaultPrice;

  const [price, setPrice] = useState<number | null>(initialPrice);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!stationId) setError("Missing stationId.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), APP_CONFIG.ui.toastDurationMs);
  }

  async function onSubmit() {
    if (submitting) return;
    if (!stationId || price === null) {
      setError("Invalid input.");
      return;
    }

    const check = validateReport({ stationId, price });
    if (!check.ok) {
      setError(check.error);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitReport({ stationId, price });
      showToast("Submitted");

      setPage({
        page: "station",
        id: String(stationId),
        stationId: null,
        price: null,
      });
    } catch (err: any) {
      setError(mapReportError(err));
    } finally {
      setSubmitting(false);
    }
  }

  function onBack() {
    if (stationId) {
      setPage({ page: "station", id: String(stationId) });
      return;
    }
    setPage({ page: "nearby" });
  }

  return (
    <ReportView
      stationId={stationId}
      price={price}
      submitting={submitting}
      error={error}
      toast={toast}
      onBack={onBack}
      onSubmit={onSubmit}
      onPriceChange={(v) => {
        setPrice(v);
        setError("");
      }}
    />
  );
}