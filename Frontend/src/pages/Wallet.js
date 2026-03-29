import { useEffect, useState } from "react";
import { api } from "../services/api";
import socket from "../services/socket";

export default function Wallet() {
  const [me, setMe] = useState(null);
  const [bets, setBets] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [user, userBets] = await Promise.all([
          api.get("/auth/me"),
          api.get("/bet")
        ]);
        setMe(user);
        setBets(userBets);
      } catch (err) {
        console.error("Wallet load error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();

    socket.on("wallet:update", (data) => {
      setLiveLogs((prev) => [data, ...prev].slice(0, 20));
      setMe((prev) => prev ? { ...prev, coins: data.coins } : prev);
    });

    socket.on("bet:update", (bet) => {
      setBets((prev) => prev.map((b) => b._id === bet._id ? bet : b));
    });

    return () => {
      socket.off("wallet:update");
      socket.off("bet:update");
    };
  }, []);

  const statusColor = (s) => ({ PENDING: "blue", WON: "green", LOST: "red" }[s] || "blue");

  if (loading) return <div className="loading"><span className="spinner" />Loading wallet...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Wallet</h1>
        <p>Your balance and bet history</p>
      </div>

      {/* Balance card */}
      <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 40 }}>🪙</div>
        <div>
          <div style={{ color: "var(--text-2)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Balance</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "var(--accent-3)", letterSpacing: "-1px" }}>
            {me?.coins ?? "—"}
          </div>
        </div>
        {liveLogs.length > 0 && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent-3)" }}>
            <span className="live-dot" />
            Live
          </div>
        )}
      </div>

      {/* Bet history */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "var(--text-2)" }}>
          🎯 Bet History
        </h2>
        {bets.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 32 }}>🎯</div>
            <h3>No bets placed yet</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Prediction</th>
                  <th>Amount</th>
                  <th>Odds</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((b) => (
                  <tr key={b._id}>
                    <td style={{ color: "var(--text-1)", fontWeight: 500 }}>{b.match}</td>
                    <td>{b.prediction}</td>
                    <td>🪙 {b.amount}</td>
                    <td>{b.odds}x</td>
                    <td><span className={`badge ${statusColor(b.status)}`}>{b.status}</span></td>
                    <td>{new Date(b.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live updates log */}
      {liveLogs.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "var(--text-2)" }}>
            <span className="live-dot" />Live Wallet Updates
          </h2>
          {liveLogs.map((l, i) => (
            <div className="wallet-log" key={i}>
              <span>User <code style={{ color: "var(--accent)" }}>{String(l.userId).slice(-6)}</code></span>
              <span style={{ color: "var(--accent-3)", fontWeight: 600 }}>🪙 {l.coins}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
