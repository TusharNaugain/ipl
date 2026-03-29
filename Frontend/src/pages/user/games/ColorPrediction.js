import { useState } from "react";
import { api } from "../../../services/api";

const COLORS = [
  { id: "red",    label: "Red",    emoji: "🔴", color: "#ff6584", bg: "rgba(255,101,132,0.12)", mult: "1.9x" },
  { id: "green",  label: "Green",  emoji: "🟢", color: "#43e97b", bg: "rgba(67,233,123,0.12)",  mult: "1.9x" },
  { id: "violet", label: "Violet", emoji: "🟣", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", mult: "4.5x" },
];

export default function ColorPrediction({ setPage }) {
  const [pick, setPick] = useState(null);
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const play = async () => {
    if (!pick) { setError("Pick a color first!"); return; }
    if (amount < 10) { setError("Minimum bet is 10 coins."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await api.post("/game/color", { pick, amount: parseInt(amount) });
      setResult(res);
      // Update local coin cache
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, coins: res.coins }));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setPick(null); };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" }}>← Back</button>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>🎨 Color Prediction</div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>Pick a color and win up to 4.5x</div>
        </div>
      </div>

      {result ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{result.won ? "🎉" : "😢"}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: result.won ? "#43e97b" : "#ff6584" }}>
            {result.won ? `You Won! +${result.payout}` : "Better luck next time"}
          </div>
          <div style={{ color: "var(--text-2)", marginBottom: 8 }}>
            Result: {COLORS.find(c => c.id === result.result)?.emoji || "?"} {result.result}
          </div>
          <div style={{ color: "var(--text-3)", marginBottom: 24 }}>Balance: 🪙 {result.coins}</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={reset}>Play Again</button>
            <button className="btn" onClick={() => setPage("games")} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" }}>Back to Games</button>
          </div>
        </div>
      ) : (
        <div className="card">
          {error && <div className="error-msg" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: "var(--text-2)" }}>Pick Your Color</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
            {COLORS.map(c => (
              <div key={c.id} onClick={() => setPick(c.id)}
                style={{
                  background: pick === c.id ? c.bg : "var(--bg-surface)",
                  border: `2px solid ${pick === c.id ? c.color : "var(--border)"}`,
                  borderRadius: 12, padding: "24px 16px", cursor: "pointer",
                  textAlign: "center", transition: "all 0.2s"
                }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{c.emoji}</div>
                <div style={{ fontWeight: 700, color: pick === c.id ? c.color : "var(--text-1)", marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{c.mult} win</div>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ maxWidth: 280 }}>
            <label>Bet Amount (coins)</label>
            <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {[50, 100, 500, 1000].map(v => (
                <button key={v} className="btn" onClick={() => setAmount(v)}
                  style={{ padding: "4px 10px", fontSize: 12, background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={play} disabled={loading || !pick}
            style={{ marginTop: 20, minWidth: 160 }}>
            {loading ? "Rolling..." : `🎲 Place Bet (${amount} coins)`}
          </button>
        </div>
      )}
    </div>
  );
}
