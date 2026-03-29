import { useEffect, useState } from "react";
import { api } from "../../services/api";

const IPL_TEAMS = ["MI", "CSK", "RCB", "KKR", "PBKS", "RR", "SRH", "DC", "GT", "LSG"];

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { api.get("/matches").then(setMatches).finally(() => setLoading(false)); }, []);

  const createMatch = async () => {
    if (!team1 || !team2 || team1 === team2) { setError("Select two different teams."); return; }
    setError("");
    try {
      const m = await api.post("/matches", { team1, team2 });
      setMatches(prev => [m, ...prev]);
      setTeam1(""); setTeam2("");
    } catch (e) { setError(e.message); }
  };

  const statusStyle = { UPCOMING: "blue", LIVE: "green", COMPLETED: "yellow" };

  if (loading) return <div className="loading"><span className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header"><h1>Matches</h1><p>Manage IPL matches</p></div>
      {error && <div className="error-msg">⚠️ {error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-2)" }}>➕ New Match</h2>
        <div className="form-row">
          <div className="form-group"><label>Team 1</label>
            <select value={team1} onChange={e => setTeam1(e.target.value)}>
              <option value="">Select...</option>{IPL_TEAMS.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Team 2</label>
            <select value={team2} onChange={e => setTeam2(e.target.value)}>
              <option value="">Select...</option>{IPL_TEAMS.filter(t => t !== team1).map(t => <option key={t}>{t}</option>)}</select></div>
        </div>
        <button className="btn btn-primary" onClick={createMatch}>Create Match</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {matches.map(m => (
          <div className="match-card" key={m._id}>
            <div className="match-teams">{m.team1} <span>vs</span> {m.team2}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className={`badge ${statusStyle[m.status]}`}>{m.status}</span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{new Date(m.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        ))}
        {matches.length === 0 && <div className="empty-state card"><div style={{ fontSize: 36 }}>🏏</div><h3>No matches yet</h3></div>}
      </div>
    </div>
  );
}
