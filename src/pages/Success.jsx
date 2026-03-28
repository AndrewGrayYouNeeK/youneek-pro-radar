import { useEffect, useState } from "react";

export default function Success() {
  const [session, setSession] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // Verify purchase
      fetch(`/functions/radarCheckout?session_id=${sessionId}`)
        .then(r => r.json())
        .then(d => setSession(d))
        .catch(() => {});
    }
  }, [sessionId]);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#050d18", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
      <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>You're in.</h1>
      <p style={{ color: "#94a3b8", fontSize: 18, maxWidth: 480, marginBottom: 40, lineHeight: 1.7 }}>
        Your purchase is confirmed. Launch YouNeeK Pro Radar now — everything is unlocked and ready.
      </p>
      <a href="/RadarScope"
        style={{ background: "#38bdf8", color: "#050d18", padding: "18px 48px", borderRadius: 12, fontWeight: 900, fontSize: 20, textDecoration: "none", display: "inline-block", marginBottom: 16 }}>
        Launch ProRadar →
      </a>
      <div style={{ color: "#475569", fontSize: 13, marginTop: 8 }}>
        A receipt was sent to your email.{" "}
        <a href="/Store" style={{ color: "#38bdf8", textDecoration: "none" }}>Back to store</a>
      </div>
    </div>
  );
}
