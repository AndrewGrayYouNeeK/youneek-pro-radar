import { useState } from "react";

const PRICES = {
  app: {
    id: "price_1TFmXQDgwDkwpQiuxNxNYjqF",
    amount: 4.99,
    label: "YouNeeK Pro Radar — App",
  },
  bundle: {
    id: "price_1TFmXVDgwDkwpQiutvj1tmMu",
    amount: 9.99,
    label: "YouNeeK Pro Radar — App + Source Code",
  },
};

const FEATURES = [
  { icon: "🌀", title: "Live NEXRAD Radar", desc: "Real-time base reflectivity from Iowa Mesonet. 5-min refresh, 6-frame loop animation." },
  { icon: "⚡", title: "Severe Weather Alerts", desc: "Live NWS tornado, severe thunderstorm, flood, and winter advisory overlays direct from api.weather.gov." },
  { icon: "📡", title: "NOAA Weather Radio", desc: "130 stations nationwide. Auto-tunes to your nearest station. Works even when internet is slow." },
  { icon: "🏠", title: "Emergency Shelter Alert", desc: "One tap sends your GPS location to 3 emergency contacts via SMS. Built for real tornado scenarios." },
  { icon: "🎯", title: "Target Tracking", desc: "Drop custom markers on the radar. Track storm cells, monitor multiple locations simultaneously." },
  { icon: "💧", title: "Rain Arrival Alerts", desc: "Get notified before rain reaches your exact location. Never get caught outside again." },
  { icon: "🛩️", title: "Air Traffic Overlay", desc: "See live aircraft on the radar map alongside weather data." },
  { icon: "🌙", title: "Dark Military UI", desc: "Designed for night use, emergency conditions, and low-light environments." },
];

export default function Store() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  const handleBuy = async (priceKey) => {
    setLoading(priceKey);
    setError("");
    try {
      const res = await fetch("/functions/radarCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: PRICES[priceKey].id, label: PRICES[priceKey].label }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    }
    setLoading(null);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#050d18", minHeight: "100vh", color: "#fff" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🌀</span>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>YouNeeK <span style={{ color: "#38bdf8" }}>Pro Radar</span></span>
        </div>
        <a href="/RadarScope" style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.4)", color: "#38bdf8", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
          Launch App →
        </a>
      </header>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 24px 60px" }}>
        <div style={{ display: "inline-block", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 99, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#38bdf8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
          Military-Grade Storm Tracker
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: -1 }}>
          Weather radar that<br /><span style={{ color: "#38bdf8" }}>takes it seriously.</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 18, maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7 }}>
          Live NEXRAD radar, real-time NWS alerts, NOAA radio, and a one-tap emergency shelter system. Built for people who need real information fast.
        </p>

        {/* Price cards */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", maxWidth: 700, margin: "0 auto" }}>

          {/* App only */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "32px 28px", width: 280, textAlign: "left" }}>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>App</div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 900 }}>$4.99</span>
              <span style={{ color: "#64748b", marginLeft: 6 }}>one-time</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Full access to YouNeeK Pro Radar. All features. No subscription. Yours forever.
            </p>
            {["Live NEXRAD radar", "NWS severe alerts", "NOAA radio (130 stations)", "Emergency shelter system", "All future updates"].map(f => (
              <div key={f} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <span style={{ color: "#22c55e" }}>✓</span>
                <span style={{ color: "#cbd5e1", fontSize: 13 }}>{f}</span>
              </div>
            ))}
            <button onClick={() => handleBuy("app")} disabled={loading === "app"}
              style={{ width: "100%", marginTop: 24, background: "#38bdf8", color: "#050d18", border: "none", borderRadius: 10, padding: "14px 0", fontWeight: 900, fontSize: 16, cursor: "pointer", opacity: loading === "app" ? 0.7 : 1 }}>
              {loading === "app" ? "Loading..." : "Buy App — $4.99"}
            </button>
          </div>

          {/* Bundle */}
          <div style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.12), rgba(56,189,248,0.04))", border: "2px solid rgba(56,189,248,0.5)", borderRadius: 20, padding: "32px 28px", width: 280, textAlign: "left", position: "relative" }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#38bdf8", color: "#050d18", fontSize: 11, fontWeight: 900, padding: "4px 16px", borderRadius: 99, whiteSpace: "nowrap" }}>
              INCLUDES SOURCE CODE
            </div>
            <div style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>App + Source</div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 900 }}>$9.99</span>
              <span style={{ color: "#64748b", marginLeft: 6 }}>one-time</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Everything in App plus full React source code. Fork it, build on it, make it yours.
            </p>
            {["Everything in App", "Full React source code", "Capacitor config (iOS ready)", "Leaflet radar components", "Custom hooks & utilities"].map(f => (
              <div key={f} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <span style={{ color: "#38bdf8" }}>✓</span>
                <span style={{ color: "#cbd5e1", fontSize: 13 }}>{f}</span>
              </div>
            ))}
            <button onClick={() => handleBuy("bundle")} disabled={loading === "bundle"}
              style={{ width: "100%", marginTop: 24, background: "transparent", color: "#38bdf8", border: "2px solid #38bdf8", borderRadius: 10, padding: "14px 0", fontWeight: 900, fontSize: 16, cursor: "pointer", opacity: loading === "bundle" ? 0.7 : 1 }}>
              {loading === "bundle" ? "Loading..." : "Buy Bundle — $9.99"}
            </button>
          </div>
        </div>

        {error && <div style={{ marginTop: 20, color: "#f87171", fontSize: 14 }}>{error}</div>}
        <p style={{ color: "#475569", fontSize: 12, marginTop: 20 }}>Secure checkout via Stripe · No account required · Instant delivery</p>
      </div>

      {/* Features */}
      <div style={{ padding: "0 24px 80px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Everything you need when it matters</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "#e2e8f0" }}>{f.title}</div>
              <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "rgba(56,189,248,0.06)", borderTop: "1px solid rgba(56,189,248,0.15)", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>Ready to track storms like a pro?</h2>
        <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 32 }}>One payment. All features. Works on any device.</p>
        <button onClick={() => handleBuy("app")} disabled={loading === "app"}
          style={{ background: "#38bdf8", color: "#050d18", border: "none", borderRadius: 12, padding: "18px 48px", fontWeight: 900, fontSize: 20, cursor: "pointer", opacity: loading === "app" ? 0.7 : 1 }}>
          {loading === "app" ? "Loading..." : "Get ProRadar — $4.99"}
        </button>
        <div style={{ marginTop: 12, color: "#475569", fontSize: 12 }}>No subscription · Secure checkout · Instant access</div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center", color: "#475569", fontSize: 12 }}>
        © 2026 Andrew Gray — YouNeeK · Built with React + Leaflet
      </footer>
    </div>
  );
}
