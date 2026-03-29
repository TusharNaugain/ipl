import { useState } from "react";
import { playNumber } from "../../services/gameEngine";

export default function NumberGame({ setPage }) {
  const [rangeMin, setRangeMin] = useState(1);
  const [rangeMax, setRangeMax] = useState(50);
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const coverage = rangeMax - rangeMin + 1;
  const multiplier = (97 / coverage).toFixed(2);

  const play = () => {
    setLoading(true); setError(""); setResult(null);
    setTimeout(() => {
      try { setResult(playNumber(rangeMin, rangeMax, amount)); }
      catch (e) { setError(e.message); }
      setLoading(false);
    }, 600);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>← Back</button>
        <div><div style={{ fontSize:24, fontWeight:700 }}>🔢 Number Prediction</div><div style={{ fontSize:13, color:"var(--text-3)" }}>Smaller range = bigger win!</div></div>
      </div>
      <div className="card" style={{ textAlign:"center" }}>
        {result && <div style={{ marginBottom:24, padding:20, background:"var(--bg-surface)", borderRadius:14 }}>
          <div style={{ fontSize:64, fontWeight:800, color:result.won?"#43e97b":"#ff6584" }}>{result.result}</div>
          <div style={{ fontSize:14, color:"var(--text-2)" }}>Range: [{result.rangeMin} - {result.rangeMax}]</div>
          <div style={{ fontSize:18, fontWeight:700, color:result.won?"#43e97b":"#ff6584", marginTop:8 }}>
            {result.won ? `🎉 +${result.payout} coins (${result.multiplier}x)` : "Out of range!"}
          </div>
          <div style={{ color:"var(--text-3)", marginTop:4 }}>Balance: 🪙 {result.coins}</div>
        </div>}
        {error && <div className="error-msg" style={{ marginBottom:12 }}>⚠️ {error}</div>}
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginBottom:16 }}>
          <div className="form-group" style={{ flex:1, maxWidth:180 }}>
            <label>Min ({rangeMin})</label>
            <input type="range" min="1" max="99" value={rangeMin} onChange={e => setRangeMin(Math.min(parseInt(e.target.value), rangeMax-1))} />
          </div>
          <div className="form-group" style={{ flex:1, maxWidth:180 }}>
            <label>Max ({rangeMax})</label>
            <input type="range" min="2" max="100" value={rangeMax} onChange={e => setRangeMax(Math.max(parseInt(e.target.value), rangeMin+1))} />
          </div>
        </div>
        <div style={{ fontSize:18, fontWeight:700, color:"var(--accent)", marginBottom:16 }}>Range: {rangeMin}-{rangeMax} → Win: {multiplier}x</div>
        <div className="form-group" style={{ maxWidth:200, margin:"0 auto 16px" }}>
          <label>Bet Amount</label>
          <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={play} disabled={loading} style={{ minWidth:200 }}>
          {loading ? "Rolling..." : `Play — ${amount} coins`}
        </button>
        {result && <button className="btn" onClick={() => setResult(null)} style={{ marginLeft:12, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>Again</button>}
      </div>
    </div>
  );
}
