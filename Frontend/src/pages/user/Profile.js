import { useEffect, useState } from "react";
import { api } from "../../services/api";

const ROLE_COLORS = { ADMIN: "purple", SMDL: "blue", MDL: "green", DL: "yellow", USER: "red" };
const ROLE_LABELS = { ADMIN: "Admin", SMDL: "Super Master", MDL: "Master", DL: "Dealer", USER: "User" };

export default function Profile() {
  const [me, setMe] = useState(null);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/auth/me"), api.get("/bet")])
      .then(([user, userBets]) => { setMe(user); setBets(userBets); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><span className="spinner" />Loading profile...</div>;

  const won = bets.filter(b => b.status === "WON").length;
  const lost = bets.filter(b => b.status === "LOST").length;
  const winRate = bets.length > 0 ? Math.round((won / bets.length) * 100) : 0;

  return (
    <div>
      <div className="page-header"><h1>Profile</h1></div>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 20, display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0
        }}>
          {me?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)" }}>{me?.name}</div>
          <div style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 8 }}>{me?.email}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className={`badge ${ROLE_COLORS[me?.role] || "blue"}`}>{ROLE_LABELS[me?.role] || me?.role}</span>
            {me?.isVIP && <span className="badge purple">💎 VIP</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon green">🪙</div><div className="stat-label">Coins</div><div className="stat-value">{me?.coins}</div></div>
        <div className="stat-card"><div className="stat-icon blue">🎯</div><div className="stat-label">Total Bets</div><div className="stat-value">{bets.length}</div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-label">Won</div><div className="stat-value">{won}</div></div>
        <div className="stat-card"><div className="stat-icon purple">📊</div><div className="stat-label">Win Rate</div><div className="stat-value">{winRate}%</div></div>
      </div>

      {/* Account info */}
      <div className="card">
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-2)" }}>Account Info</h2>
        {[
          ["Member Since", new Date(me?.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })],
          ["Role", ROLE_LABELS[me?.role] || me?.role],
          ["VIP Status", me?.isVIP ? `Active (expires ${new Date(me?.vipExpiry).toLocaleDateString("en-IN")})` : "Not Active"],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-3)", fontSize: 13 }}>{label}</span>
            <span style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
