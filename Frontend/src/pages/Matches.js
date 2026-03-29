import { useEffect, useState } from "react";
import { api } from "../services/api";

const IPL_TEAMS = [
  "MI", "CSK", "RCB", "KKR", "PBKS", "RR", "SRH", "DC", "GT", "LSG"
];

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");

  const fetchMatches = () => {
    api.get("/matches")
      .then(setMatches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatches(); }, []);

  const createMatch = async () => {
    if (!team1 || !team2) { setError("Select both teams."); return; }
    if (team1 === team2) { setError("Teams must be different."); return; }
    setCreating(true);
    setError("");
    try {
      const match = await api.post("/matches", { team1, team2 });
      setMatches((prev) => [match, ...prev]);
      setTeam1("");
      setTeam2("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const statusColor = (s) => ({ UPCOMING: "blue", LIVE: "green", COMPLETED: "yellow" }[s] || "blue");

  if (loading) return <div className="loading"><span className="spinner" />Loading matches...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Matches</h1>
        <p>Create and manage IPL matches</p>
      </div>

      {/* Create form */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "var(--text-2)" }}>
          ➕ Create New Match
        </h2>
        {error && <div className="error-msg">⚠️ {error}</div>}
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Team 1</label>
            <select value={team1} onChange={(e) => setTeam1(e.target.value)}>
              <option value="">Select team...</option>
              {IPL_TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Team 2</label>
            <select value={team2} onChange={(e) => setTeam2(e.target.value)}>
              <option value="">Select team...</option>
              {IPL_TEAMS.filter((t) => t !== team1).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={createMatch}
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Match"}
        </button>
      </div>

      {/* Match list */}
      {matches.length === 0 ? (
        <div className="empty-state card">
          <div style={{ fontSize: 40 }}>🏏</div>
          <h3>No matches yet</h3>
          <p>Create the first match above.</p>
        </div>
      ) : (
        <div className="match-list">
          {matches.map((m) => (
            <div className="match-card" key={m._id}>
              <div className="match-teams">
                {m.team1} <span>vs</span> {m.team2}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={`badge ${statusColor(m.status)}`}>{m.status}</span>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {new Date(m.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
