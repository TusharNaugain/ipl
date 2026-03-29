import { useState } from "react";
import { playTower } from "../../services/gameEngine";

export default function TowerGame({ setPage }) {
  const [difficulty, setDifficulty] = useState("medium");
  const [floors, setFloors] = useState(5);
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeP = { easy: 0.75, medium: 0.5, hard: 0.33 }[difficulty];
  const multiplier = (0.97 / Math.pow(safeP, floors)).toFixed(2);

  const play = () => {
    setLoading(true); setError(""); setResult(null);
    setTimeout(() => {
      try { setResult(playTower(floors, difficulty, amount)); }
      catch (e) { setError(e.message); }
      setLoading(false);
    }, 1000);
  };


  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" }}>← Back</button>
        <div><div style={{ fontSize: 24, fontWeight: 700 }}>🗼 Dragon Tower</div><div style={{ fontSize: 13, color: "var(--text-3)" }}>Climb the tower — don't fall!</div></div>
      </div>
      <div className="card" style={{ textAlign: "center" }}>
        {result && (
          <div style={{ marginBottom: 20 }}>
            {/* Tower visual */}
            <div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 4, marginBottom: 16 }}>
              {result.floors.map((f, i) => (
                <div key={i} style={{
                  display: "flex", gap: 4, justifyContent: "center"
                }}>
                  <div style={{ width: 48, height: 36, borderRadius: 8, background: f.safe ? "rgba(67,233,123,0.15)" : "rgba(255,101,132,0.15)", border: `1px solid ${f.safe ? "rgba(67,233,123,0.3)" : "rgba(255,101,132,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    {f.safe ? "✅" : "💀"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: result.won ? "#43e97b" : "#ff6584" }}>
              {result.won ? `🎉 Climbed ${result.floors.length} floors! Won ${result.payout} coins (${result.multiplier}x)` : `💀 Fell on floor ${result.floors.length}!`}
            </div>
            <div style={{ color: "var(--text-3)", marginTop: 4 }}>Balance: 🪙 {result.coins}</div>
          </div>
        )}
        {error && <div className="error-msg" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {["easy","medium","hard"].map(d => (
            <button key={d} onClick={() => setDifficulty(d)} className="btn"
              style={{ padding: "8px 20px", textTransform: "capitalize", background: difficulty === d ? "var(--accent)" : "var(--bg-surface)", color: difficulty === d ? "#fff" : "var(--text-2)", border: `1px solid ${difficulty === d ? "var(--accent)" : "var(--border)"}` }}>
              {d}
            </button>
          ))}
        </div>
        <div className="form-group" style={{ maxWidth: 240, margin: "0 auto 12px" }}>
          <label>Floors: {floors}</label>
          <input type="range" min="1" max="15" value={floors} onChange={e => setFloors(parseInt(e.target.value))} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-3)", marginBottom: 16 }}>{multiplier}x</div>
        <div className="form-group" style={{ maxWidth: 200, margin: "0 auto 16px" }}><label>Bet</label><input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} /></div>
        <button className="btn btn-primary" onClick={play} disabled={loading} style={{ minWidth: 200 }}>{loading ? "Climbing..." : `🗼 Climb (${amount} coins)`}</button>
      </div>
    </div>
  );
}
