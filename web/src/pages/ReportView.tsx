import PriceStepper from "../components/PriceStepper";
import APP_CONFIG from "../config/app.config";

type Props = {
  stationId: number | null;
  price: number | null;
  submitting: boolean;
  error: string;
  toast: string;

  onBack: () => void;
  onSubmit: () => void;
  onPriceChange: (v: number | null) => void;
};

export default function ReportView(props: Props) {
  const {
    stationId,
    price,
    submitting,
    error,
    toast,
    onBack,
    onSubmit,
    onPriceChange,
  } = props;

  return (
    <div className="page">
      <div className="topBar">
        <button className="backBtn" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="header">
        <div className="title">Report</div>
        <div className="subtitle">Station: {stationId ?? "-"}</div>
      </div>

      <div className="card">
        <div className="label">Price</div>

        <PriceStepper
          value={price}
          min={APP_CONFIG.report.minPrice}
          max={APP_CONFIG.report.maxPrice}
          step={APP_CONFIG.report.priceStep}
          decimals={APP_CONFIG.report.decimals}
          placeholder={`e.g. ${APP_CONFIG.report.defaultPrice}`}
          onChange={onPriceChange}
        />

        {!!error && <div className="error">{error}</div>}

        <button
          className="btn primary"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      {!!toast && <div className="toast">{toast}</div>}
    </div>
  );
}