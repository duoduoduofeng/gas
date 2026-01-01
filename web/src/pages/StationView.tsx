import type { RecentReportVM, StationHeaderVM } from "../utils/viewmodel";
import "./station.css";

type Props = {
  header: StationHeaderVM;
  reports: RecentReportVM[];
  loading: boolean;
  error: string;

  onBack: () => void;
  onGoReport: () => void;
  onRefresh: () => void;
};

export default function StationView(props: Props) {
  const { header, reports, loading, error, onBack, onGoReport, onRefresh } = props;

  return (
    <div className="page">
      <div className="topBar">
        <button className="backBtn" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="headerCard">
        <div className="titleRow">
          <div className="name">{header.name}</div>
          <div className={`badge ${header.badge}`}>{header.badge}</div>
        </div>

        <div className="summary">
          <div className="metric">
            <div className="k">Price</div>
            <div className="v price">{header.currentPriceText}</div>
          </div>

          <div className="metric">
            <div className="k">Reports</div>
            <div className="v">{header.reportCount}</div>
          </div>

          <div className="metric">
            <div className="k">Updated</div>
            <div className="v">{header.lastUpdatedText}</div>
          </div>
        </div>

        <div className="actions">
          <button className="reportBtn" onClick={onGoReport}>
            Report
          </button>
          <button className="refreshWrap" onClick={onRefresh} aria-label="refresh">
            <div className="refreshBtn">↻</div>
          </button>
        </div>
      </div>

      {loading && <div className="state">Loading...</div>}
      {!!error && <div className="state error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="sectionTitle">Recent Reports</div>

          {reports.length === 0 && <div className="state">No reports</div>}

          {reports.map((r) => (
            <div key={r.id} className="reportRow">
              <div className="left">
                <div className="priceText">{r.priceText}</div>
                <div className="timeText">{r.timeText}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}