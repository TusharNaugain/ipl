import { useEffect, useState } from "react";
import { api } from "../../services/api";
import socket from "../../services/socket";

export default function UserWallet() {
  const [me, setMe] = useState(null);
  const [bets, setBets] = useState([]);
  const [txns, setTxns] = useState([]);
  const [tab, setTab] = useState("bets");
  const [loading, setLoading] = useState(true);
  const [liveLogs, setLiveLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [user, userBets, transactions] = await Promise.all([
        api.get("/auth/me"),
        api.get("/bet"),
        api.get("/game/transactions")
      ]);
      setMe(user);
      setBets(userBets);
      setTxns(transactions);
      setLoading(false);
    };
    load();

    socket.on("wallet:update", (data) => {
      setLiveLogs(prev => [data, ...prev].slice(0, 10));
      setMe(prev => prev ? { ...prev, coins: data.coins } : prev);
    });
    socket.on("bet:update", (bet) => {
      setBets(prev => prev.map(b => b._id === bet._id ? bet : b));
    });
    return () => { socket.off("wallet:update"); socket.off("bet:update"); };
  }, []);

  const betStatusColor = { PENDING: "blue", WON: "green", LOST: "red" };
  const txnColor = { CREDIT: "green", WIN: "green", COMMISSION: "blue", DEBIT: "red", LOSS: "red", BET: "yellow" };

  if (loading) return <div className="loading"><span className="spinner" />Loading wallet...</div>;

  return (
    <div>
      <div className="page-header"><h1>Wallet</h1><p>Your balance & history</p></div>

      {/* Balance */}
      <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 48 }}>🪙</div>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Balance</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#43e97b", letterSpacing: "-1px" }}>{me?.coins ?? "—"}</div>
        </div>
        {liveLogs.length > 0 && (
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#43e97b", display: "flex", alignItems: "center", gap: 6 }}>
            <span className="live-dot" />Live
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[["bets","🎯 Bets"],["txns","💸 Transactions"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className="btn"
            style={{ background: tab === id ? "var(--accent)" : "var(--bg-card)", color: tab === id ? "#fff" : "var(--text-2)", border: `1px solid ${tab === id ? "var(--accent)" : "var(--border)"}` }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "bets" ? (
        <div className="card">
          {bets.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: 32 }}>🎯</div><h3>No bets yet</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Match</th><th>Prediction</th><th>Amount</th><th>Odds</th><th>Status</th></tr></thead>
                <tbody>
                  {bets.map(b => (
                    <tr key={b._id}>
                      <td style={{ color: "var(--text-1)", fontWeight: 500 }}>{b.match}</td>
                      <td>{b.prediction}</td>
                      <td>🪙 {b.amount}</td>
                      <td>{b.odds}x</td>
                      <td><span className={`badge ${betStatusColor[b.status]}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          {txns.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: 32 }}>💸</div><h3>No transactions yet</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Type</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
                <tbody>
                  {txns.map(t => (
                    <tr key={t._id}>
                      <td><span className={`badge ${txnColor[t.type] || "blue"}`}>{t.type}</span></td>
                      <td style={{ color: ["CREDIT","WIN","COMMISSION"].includes(t.type) ? "#43e97b" : "#ff6584", fontWeight: 600 }}>
                        🪙 {t.amount}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-3)" }}>{t.description}</td>
                      <td>{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
