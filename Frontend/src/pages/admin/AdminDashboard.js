import { useEffect, useState } from "react";
import { api } from "../../services/api";
import socket from "../../services/socket";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, bets: 0, pending: 0, won: 0, transactions: 0 });
  const [me, setMe] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [users, bets, user] = await Promise.all([
        api.get("/users"), api.get("/bet"), api.get("/auth/me")
      ]);
      setMe(user);
      const byRole = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});
      setStats({
        users: users.length,
        bets: bets.length,
        pending: bets.filter(b => b.status === "PENDING").length,
        won: bets.filter(b => b.status === "WON").length,
        byRole
      });
    };
    load();
    socket.on("wallet:update", ({ coins }) => setMe(p => p ? { ...p, coins } : p));
    return () => socket.off("wallet:update");
  }, []);

  const roleColors = { ADMIN: "purple", SMDL: "blue", MDL: "green", DL: "yellow", USER: "red" };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome, {me?.name} · <span className={`badge ${roleColors[me?.role]}`}>{me?.role}</span></p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon purple">👥</div><div className="stat-label">Users</div><div className="stat-value">{stats.users}</div></div>
        <div className="stat-card"><div className="stat-icon blue">🎯</div><div className="stat-label">Total Bets</div><div className="stat-value">{stats.bets}</div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div className="stat-label">Pending</div><div className="stat-value">{stats.pending}</div></div>
        <div className="stat-card"><div className="stat-icon green">🪙</div><div className="stat-label">My Coins</div><div className="stat-value">{me?.coins ?? "—"}</div></div>
      </div>

      {stats.byRole && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: "var(--text-2)" }}>👥 Users by Role</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(stats.byRole).map(([role, count]) => (
              <div key={role} style={{ textAlign: "center" }}>
                <span className={`badge ${roleColors[role] || "blue"}`}>{role}</span>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, color: "var(--text-1)" }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--text-2)" }}>⚡ Result Engine</h2>
        <p style={{ color: "var(--text-3)", fontSize: 13 }}>
          Auto simulation runs every <strong style={{ color: "var(--text-2)" }}>30 seconds</strong> — settles all PENDING bets and pushes live wallet updates via Socket.IO.
        </p>
      </div>
    </div>
  );
}
