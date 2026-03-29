import { useState } from "react";
import { playDice } from "../../services/gameEngine";

const FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];

export default function DiceGame({ setPage }) {
  const [pick, setPick] = useState(null);
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState("");

  const play = () => {
    if (!pick) return setError("Pick a number 1-6!");
    setRolling(true); setError(""); setResult(null);
    setTimeout(() => {
      try { setResult(playDice(pick, amount)); }
      catch (e) { setError(e.message); }
      setRolling(false);
    }, 1000);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>← Back</button>
        <div><div style={{ fontSize:24, fontWeight:700 }}>🎲 Dice Roll</div><div style={{ fontSize:13, color:"var(--text-3)" }}>Guess the number — win 5.5x!</div></div>
      </div>
      <div className="card">
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:100, lineHeight:1, display:"inline-block", animation:rolling?"spin 0.1s linear infinite":"none" }}>
            {result ? FACES[result.result-1] : (pick ? FACES[pick-1] : "🎲")}
          </div>
          {result && <div style={{ marginTop:12, fontSize:22, fontWeight:700, color:result.won?"#43e97b":"#ff6584" }}>
            {result.won ? `🎉 +${result.payout} coins!` : `Rolled ${result.result} — You lose`}
          </div>}
          {result && <div style={{ color:"var(--text-3)", marginTop:4 }}>Balance: 🪙 {result.coins}</div>}
        </div>
        {error && <div className="error-msg" style={{ marginBottom:16 }}>⚠️ {error}</div>}
        <h2 style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"var(--text-2)" }}>Pick a Number (1–6)</h2>
        <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
          {[1,2,3,4,5,6].map(n => (
            <div key={n} onClick={() => !rolling && setPick(n)}
              style={{ width:56, height:56, borderRadius:12, cursor:"pointer", background:pick===n?"var(--accent)":"var(--bg-surface)", border:`2px solid ${pick===n?"var(--accent)":"var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, transition:"all 0.2s" }}>
              {FACES[n-1]}
            </div>
          ))}
        </div>
        <div className="form-group" style={{ maxWidth:280 }}>
          <label>Bet Amount</label>
          <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} disabled={rolling} />
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            {[50,100,500,1000].map(v => <button key={v} className="btn" onClick={() => setAmount(v)} disabled={rolling} style={{ padding:"4px 12px", fontSize:12, background:"var(--bg-hover)", border:"1px solid var(--border)", color:"var(--text-2)" }}>{v}</button>)}
          </div>
        </div>
        <div style={{ display:"flex", gap:12, marginTop:20 }}>
          <button className="btn btn-primary" onClick={play} disabled={rolling||!pick} style={{ minWidth:160 }}>
            {rolling ? "🎲 Rolling..." : `Roll — ${amount} coins`}
          </button>
          {result && <button className="btn" onClick={() => { setResult(null); setPick(null); }} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>Again</button>}
        </div>
      </div>
    </div>
  );
}
