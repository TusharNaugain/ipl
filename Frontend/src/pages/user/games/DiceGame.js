import { useState } from "react";
import { api } from "../../../services/api";

export default function DiceGame({ setPage }) {
  const [pick, setPick] = useState(null);
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState("");
  const [diceAnim, setDiceAnim] = useState(false);

  const DICE_FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];

  const play = async () => {
    if (!pick) { setError("Pick a number first!"); return; }
    if (amount < 10) { setError("Minimum bet is 10 coins."); return; }
    setRolling(true); setDiceAnim(true); setError(""); setResult(null);
    setTimeout(async () => {
      try {
        const res = await api.post("/game/dice", { pick: parseInt(pick), amount: parseInt(amount) });
        setResult(res);
        setDiceAnim(false);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...user, coins: res.coins }));
      } catch (e) { setError(e.message); setDiceAnim(false); }
      finally { setRolling(false); }
    }, 1200);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" }}>← Back</button>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>🎲 Dice Roll</div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>Guess it right, win 5.5x!</div>
        </div>
      </div>

      <div className="card">
        {/* Dice display */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            fontSize: 100, lineHeight: 1,
            animation: diceAnim ? "spin 0.15s linear infinite" : "none",
            display: "inline-block"
          }}>
            {result ? DICE_FACES[result.result - 1] : (pick ? DICE_FACES[pick - 1] : "🎲")}
          </div>
          {result && (
            <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: result.won ? "#43e97b" : "#ff6584" }}>
              {result.won ? `🎉 Won! +${result.payout} coins` : `😢 Rolled ${result.result} — You lose!`}
            </div>
          )}
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-2)" }}>Pick a Number (1-6)</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {[1,2,3,4,5,6].map(n => (
            <div key={n} onClick={() => !rolling && setPick(n)}
              style={{
                width: 56, height: 56, borderRadius: 12, cursor: "pointer",
                background: pick === n ? "var(--accent)" : "var(--bg-surface)",
                border: `2px solid ${pick === n ? "var(--accent)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, transition: "all 0.2s", userSelect: "none"
              }}>
              {DICE_FACES[n-1]}
            </div>
          ))}
        </div>

        <div className="form-group" style={{ maxWidth: 280 }}>
          <label>Bet Amount</label>
          <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} disabled={rolling} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {[50, 100, 500, 1000].map(v => (
              <button key={v} className="btn" onClick={() => setAmount(v)} disabled={rolling}
                style={{ padding: "4px 10px", fontSize: 12, background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button className="btn btn-primary" onClick={play} disabled={rolling || !pick} style={{ minWidth: 160 }}>
            {rolling ? "🎲 Rolling..." : `Roll (${amount} coins)`}
          </button>
          {result && <button className="btn" onClick={() => { setResult(null); setPick(null); }}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
            Play Again
          </button>}
        </div>
      </div>
    </div>
  );
}
