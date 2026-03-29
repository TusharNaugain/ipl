import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function Home({ setPage }) {
  const [matches, setMatches] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { api.get("/matches").then(setMatches).catch(() => {}); }, []);

  const games = [
    { id: "color", icon: "🎨", label: "Color Prediction", desc: "Pick Red, Green or Violet", color: "#6c63ff" },
    { id: "dice",  icon: "🎲", label: "Dice Game",         desc: "Guess the number (5.5x)", color: "#ff6584" },
    { id: "spin",  icon: "🎰", label: "Spin Wheel",        desc: "Spin & win up to 10x!",   color: "#43e97b" },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(255,101,132,0.1) 100%)",
        border: "1px solid rgba(108,99,255,0.2)",
        borderRadius: 16, padding: "28px 32px", marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 6 }}>Welcome back 👋</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>{user.name || "User"}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#43e97b" }}>🪙 {user.coins || "—"}</span>
          </div>
        </div>
        <div style={{ fontSize: 64 }}>🏏</div>
      </div>

      {/* Live matches */}
      <div className="page-header"><h1>Live Matches</h1></div>
      {matches.length === 0 ? (
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="empty-state" style={{ padding: "30px 0" }}>
            <div style={{ fontSize: 36 }}>🏏</div><h3>No live matches</h3>
          </div>
        </div>
      ) : (
        <div className="match-list" style={{ marginBottom: 28 }}>
          {matches.slice(0, 3).map(m => (
            <div className="match-card" key={m._id} onClick={() => setPage("ipl")} style={{ cursor: "pointer" }}>
              <div className="match-teams">{m.team1} <span>vs</span> {m.team2}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className={`badge ${m.status === "LIVE" ? "green" : m.status === "COMPLETED" ? "yellow" : "blue"}`}>{m.status}</span>
                {m.status === "LIVE" && <span style={{ fontSize: 12, color: "#43e97b" }}><span className="live-dot" />LIVE</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Games */}
      <div className="page-header"><h1>Quick Games</h1></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {games.map(g => (
          <div key={g.id} onClick={() => setPage(g.id)}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14,
              padding: "24px 20px", cursor: "pointer", transition: "all 0.2s", textAlign: "center"
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>{g.icon}</div>
            <div style={{ fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>{g.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{g.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
