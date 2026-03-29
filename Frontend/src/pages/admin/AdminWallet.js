import { useEffect, useState } from "react";
import { api } from "../../services/api";
import socket from "../../services/socket";

export default function AdminWallet() {
  const [me, setMe] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [user, transactions] = await Promise.all([
        api.get("/auth/me"),
        api.get("/game/transactions/all").catch(() => [])
      ]);
      setMe(user);
      setTxns(transactions);
      setLoading(false);
    };
    load();
    socket.on("wallet:update", ({ coins }) => setMe(p => p ? { ...p, coins } : p));
    return () => socket.off("wallet:update");
  }, []);

  const txnColor = { CREDIT: "green", WIN: "green", COMMISSION: "blue", DEBIT: "red", LOSS: "red", BET: "yellow", VIP_PURCHASE: "purple" };

  if (loading) return <div className="loading"><span className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header"><h1>Wallet (Admin)</h1><p>All platform transactions</p></div>

      <div className="card" style={{ marginBottom: 20, display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ fontSize: 40 }}>🪙</div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Your Balance</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "var(--accent-3)", letterSpacing: "-1px" }}>{me?.coins ?? "—"}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-2)" }}>All Transactions</h2>
        {txns.length === 0 ? (
          <div className="empty-state"><div style={{ fontSize: 32 }}>💸</div><h3>No transactions yet</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t._id}>
                    <td style={{ color: "var(--text-1)", fontWeight: 500 }}>{t.userId?.name || "—"}</td>
                    <td><span className={`badge ${txnColor[t.type] || "blue"}`}>{t.type}</span></td>
                    <td style={{ color: ["CREDIT","WIN","COMMISSION"].includes(t.type) ? "#43e97b" : "#ff6584", fontWeight: 600 }}>
                      🪙 {t.amount}
                    </td>
                    <td style={{ color: "var(--text-3)", fontSize: 12 }}>{t.description}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
