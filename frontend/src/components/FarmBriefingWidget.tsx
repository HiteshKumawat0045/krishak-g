export interface FarmBriefingData {
  location: string;
  weatherSummary: string;
  mandiSummary: string;
  alertMessage: string;
  recommendation: string;
  spokenBriefing: string;
  updatedAt: string;
}

interface FarmBriefingWidgetProps {
  briefing: FarmBriefingData | null;
  loading: boolean;
  onSpeakBriefing: (text: string) => void;
  isHighlighted?: boolean;
}

export default function FarmBriefingWidget({
  briefing,
  loading,
  onSpeakBriefing,
  isHighlighted = false
}: FarmBriefingWidgetProps) {
  if (loading) {
    return (
      <div className="dash-card" style={{ border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "16px", padding: "1.2rem", background: "rgba(15, 23, 42, 0.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#4ade80" }}>📌 Today's Farm Briefing</span>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Synthesizing data...</span>
        </div>
        <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
          Gathering weather, mandi, and crop advisories for your farm...
        </div>
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div
      id="briefing-card"
      className={`dash-card ${isHighlighted ? "active-glow" : ""}`}
      style={{
        border: isHighlighted ? "2px solid #4ade80" : "1px solid rgba(34, 197, 94, 0.3)",
        borderRadius: "16px",
        padding: "1.2rem",
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(22, 101, 52, 0.25))",
        boxShadow: isHighlighted ? "0 0 25px rgba(34, 197, 94, 0.5)" : "0 4px 20px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <span style={{ fontSize: "1.15rem", fontWeight: "700", color: "#4ade80", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            📌 TODAY ON YOUR FARM
          </span>
          <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
            📍 {briefing.location} • Updated {briefing.updatedAt}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSpeakBriefing(briefing.spokenBriefing)}
          style={{
            background: "linear-gradient(135deg, #15803d, #22c55e)",
            color: "#ffffff",
            border: "none",
            borderRadius: "20px",
            padding: "0.4rem 1rem",
            fontSize: "0.85rem",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "0 2px 8px rgba(34, 197, 94, 0.4)"
          }}
        >
          🔊 Listen Briefing
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.8rem" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "0.8rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>
            🌦️ Weather Outlook
          </span>
          <span style={{ fontSize: "0.9rem", color: "#f8fafc" }}>{briefing.weatherSummary}</span>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "0.8rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: "0.8rem", color: "#facc15", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>
            🌾 Mandi Prices
          </span>
          <span style={{ fontSize: "0.9rem", color: "#f8fafc" }}>{briefing.mandiSummary}</span>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "0.8rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: "0.8rem", color: "#f87171", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>
            ⚠️ Farm Alert
          </span>
          <span style={{ fontSize: "0.9rem", color: "#f8fafc" }}>{briefing.alertMessage}</span>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "0.8rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: "0.8rem", color: "#4ade80", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>
            💡 Action Recommendation
          </span>
          <span style={{ fontSize: "0.9rem", color: "#f8fafc" }}>{briefing.recommendation}</span>
        </div>
      </div>
    </div>
  );
}
