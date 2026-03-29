import { useEffect, useState } from "react";
import { api } from "../services/api";
import socket from "../services/socket";

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, bets: 0, pending: 0 });
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, bets, user] = await Promise.all([
          api.get("/users"),
          api.get("/bet"),
          api.get("/auth/me")
        ]);
        setStats({
          users: users.length,
          bets: bets.length,
          pending: bets.filter((b) => b.status === "PENDING").length,
          won: bets.filter((b) => b.status === "WON").length,
        });
        setMe(user);
      } catch (err) {
        console.error("Dashboard load error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Live wallet updates
    socket.on("wallet:update", ({ coins }) => {
      setMe((prev) => prev ? { ...prev, coins } : prev);
    });

    return () => socket.off("wallet:update");
  }, []);

  if (loading) return <div className="loading"><span className="spinner" />Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {me?.name || "Admin"} — here's what's happening.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.users}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🎯</div>
          <div className="stat-label">Total Bets</div>
          <div className="stat-value">{stats.bets}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-label">Pending Bets</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🪙</div>
          <div className="stat-label">My Coins</div>
          <div className="stat-value">{me?.coins ?? "—"}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "var(--text-2)" }}>
          🏏 Result Engine
        </h2>
        <p style={{ color: "var(--text-3)", fontSize: 13 }}>
          Auto-simulation runs every <strong style={{ color: "var(--text-2)" }}>30 seconds</strong>, settling PENDING bets with randomised outcomes and distributing winnings in real-time via Socket.IO.
        </p>
      </div>
    </div>
  );
}
