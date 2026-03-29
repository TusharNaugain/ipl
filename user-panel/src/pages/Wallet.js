import { useEffect, useState } from "react";
import { getWalletUser, getTransactions, getBalance } from "../services/gameEngine";

export default function UserWallet() {
  const [me, setMe] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  const txnColor = { CREDIT:"green", WIN:"green", COMMISSION:"blue", DEBIT:"red", LOSS:"red", BET:"yellow" };

  const refresh = () => {
    setMe(getWalletUser());
    setTxns(getTransactions());
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  if (loading) return <div className="loading"><span className="spinner" />Loading wallet...</div>;

  return (
    <div>
      <div className="page-header"><h1>Wallet</h1><p>Your balance & history</p></div>

      <div className="card" style={{ marginBottom:20, display:"flex", alignItems:"center", gap:20 }}>
        <div style={{ fontSize:48 }}>🪙</div>
        <div>
          <div style={{ fontSize:12, color:"var(--text-3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>Balance</div>
          <div style={{ fontSize:40, fontWeight:700, color:"#43e97b", letterSpacing:"-1px" }}>{me?.coins ?? 0}</div>
        </div>
        <button className="btn" onClick={refresh} style={{ marginLeft:"auto", background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>🔄 Refresh</button>
      </div>

      <div className="card">
        <h2 style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"var(--text-2)" }}>💸 Transaction History</h2>
        {txns.length === 0 ? (
          <div className="empty-state"><div style={{ fontSize:32 }}>💸</div><h3>No transactions yet</h3><p>Play games and your history will appear here</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Type</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t._id}>
                    <td><span className={`badge ${txnColor[t.type] || "blue"}`}>{t.type}</span></td>
                    <td style={{ color:["CREDIT","WIN","COMMISSION"].includes(t.type)?"#43e97b":"#ff6584", fontWeight:600 }}>
                      🪙 {t.amount}
                    </td>
                    <td style={{ fontSize:12, color:"var(--text-3)" }}>{t.description}</td>
                    <td style={{ fontSize:12 }}>{new Date(t.createdAt).toLocaleString("en-IN")}</td>
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
