import { useEffect, useState } from "react";
import { api } from "../../services/api";
import socket from "../../services/socket";

export default function AdminPredictions() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ matchId: "", matchLabel: "", ballNo: "", prediction: "", confidence: 75, isVIP: false });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const [m, p] = await Promise.all([api.get("/matches"), api.get("/predictions")]);
      setMatches(m);
      setPredictions(p);
      setLoading(false);
    };
    load();
  }, []);

  const onMatchChange = (matchId) => {
    const m = matches.find(x => x._id === matchId);
    setForm(f => ({ ...f, matchId, matchLabel: m ? `${m.team1} vs ${m.team2}` : "" }));
  };

  const submit = async () => {
    setError("");
    try {
      const pred = await api.post("/predictions", form);
      // Push live to all connected users
      socket.emit("admin:prediction", pred);
      setPredictions(prev => [pred, ...prev]);
      setForm(f => ({ ...f, ballNo: "", prediction: "", confidence: 75, isVIP: false }));
    } catch (e) { setError(e.message); }
  };

  const markResult = async (id, result) => {
    try {
      const updated = await api.post(`/predictions/${id}`, { result }); // will use PATCH via api
      setPredictions(prev => prev.map(p => p._id === id ? { ...p, result } : p));
    } catch (e) {}
  };

  const deletePred = async (id) => {
    try {
      await fetch(`/api/predictions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setPredictions(prev => prev.filter(p => p._id !== id));
    } catch (e) {}
  };

  const resultColor = { CORRECT: "green", WRONG: "red", PENDING: "yellow" };

  if (loading) return <div className="loading"><span className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>🎯 Predictions</h1>
        <p>Push ball-by-ball predictions live to all users</p>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-2)" }}>➕ New Prediction</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Match</label>
            <select value={form.matchId} onChange={e => onMatchChange(e.target.value)}>
              <option value="">Select match...</option>
              {matches.map(m => <option key={m._id} value={m._id}>{m.team1} vs {m.team2}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Ball No. (e.g. 12.3)</label><input value={form.ballNo} onChange={e => setForm({ ...form, ballNo: e.target.value })} placeholder="12.3" /></div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Prediction</label>
            <select value={form.prediction} onChange={e => setForm({ ...form, prediction: e.target.value })}>
              <option value="">Select...</option>
              {["4 Run", "6 Run", "Dot Ball", "Single", "Wicket", "Wide", "No Ball", "Boundary"].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Confidence: {form.confidence}%</label>
            <input type="range" min="40" max="99" value={form.confidence} onChange={e => setForm({ ...form, confidence: parseInt(e.target.value) })} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-2)" }}>
            <input type="checkbox" checked={form.isVIP} onChange={e => setForm({ ...form, isVIP: e.target.checked })} />
            💎 VIP Only Prediction
          </label>
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={!form.matchId || !form.prediction}>
          📡 Push Live
        </button>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-2)" }}>All Predictions</h2>
        {predictions.length === 0 ? (
          <div className="empty-state"><div style={{ fontSize: 32 }}>🎯</div><h3>No predictions yet</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Match</th><th>Ball</th><th>Prediction</th><th>Conf.</th><th>VIP</th><th>Result</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {predictions.map(p => (
                  <tr key={p._id}>
                    <td style={{ color: "var(--text-1)", fontWeight: 500 }}>{p.matchLabel}</td>
                    <td>{p.ballNo || "—"}</td>
                    <td>{p.prediction}</td>
                    <td><span style={{ color: p.confidence >= 80 ? "#43e97b" : p.confidence >= 60 ? "#ffc700" : "#ff6584" }}>{p.confidence}%</span></td>
                    <td>{p.isVIP ? <span className="badge purple">VIP</span> : "—"}</td>
                    <td><span className={`badge ${resultColor[p.result]}`}>{p.result}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn" style={{ padding: "3px 8px", fontSize: 11, background: "rgba(67,233,123,0.1)", color: "#43e97b", border: "1px solid rgba(67,233,123,0.2)" }}
                          onClick={() => markResult(p._id, "CORRECT")}>✓</button>
                        <button className="btn" style={{ padding: "3px 8px", fontSize: 11, background: "rgba(255,101,132,0.1)", color: "#ff6584", border: "1px solid rgba(255,101,132,0.2)" }}
                          onClick={() => markResult(p._id, "WRONG")}>✗</button>
                        <button className="btn btn-danger" style={{ padding: "3px 8px", fontSize: 11 }}
                          onClick={() => deletePred(p._id)}>🗑</button>
                      </div>
                    </td>
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
