import { useState } from "react";
import { playLimbo } from "../../services/gameEngine";

export default function LimboGame({ setPage }) {
  const [target, setTarget] = useState(2.0);
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const play = () => {
    setLoading(true); setError(""); setResult(null);
    setTimeout(() => {
      try { setResult(playLimbo(target, amount)); }
      catch (e) { setError(e.message); }
      setLoading(false);
    }, 800);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>← Back</button>
        <div><div style={{ fontSize:24, fontWeight:700 }}>♾️ Limbo</div><div style={{ fontSize:13, color:"var(--text-3)" }}>Set target — higher = riskier!</div></div>
      </div>
      <div className="card" style={{ textAlign:"center" }}>
        {result && <div style={{ marginBottom:24, padding:24, background:"var(--bg-surface)", borderRadius:14 }}>
          <div style={{ fontSize:64, fontWeight:800, color:result.won?"#43e97b":"#ff6584", letterSpacing:"-2px" }}>{result.result}x</div>
          <div style={{ fontSize:14, color:"var(--text-2)" }}>Target: {result.target}x</div>
          <div style={{ fontSize:18, fontWeight:700, color:result.won?"#43e97b":"#ff6584", marginTop:8 }}>
            {result.won ? `🎉 +${result.payout} coins!` : "Didn't reach target!"}
          </div>
          <div style={{ color:"var(--text-3)", marginTop:4 }}>Balance: 🪙 {result.coins}</div>
        </div>}
        {error && <div className="error-msg" style={{ marginBottom:12 }}>⚠️ {error}</div>}
        <div className="form-group" style={{ maxWidth:280, margin:"0 auto 16px" }}>
          <label>Target: {target}x</label>
          <input type="range" min="1.1" max="100" step="0.1" value={target} onChange={e => setTarget(parseFloat(e.target.value))} />
          <div style={{ display:"flex", gap:6, marginTop:6, justifyContent:"center" }}>
            {[1.5,2,5,10,50,100].map(v => <button key={v} className="btn" onClick={() => setTarget(v)} style={{ padding:"3px 8px", fontSize:11, background:target===v?"var(--accent)":"var(--bg-hover)", border:"1px solid var(--border)", color:target===v?"#fff":"var(--text-2)" }}>{v}x</button>)}
          </div>
        </div>
        <div className="form-group" style={{ maxWidth:200, margin:"0 auto 16px" }}>
          <label>Bet Amount</label>
          <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={play} disabled={loading} style={{ minWidth:200 }}>
          {loading ? "Going..." : `♾️ Play @${target}x — ${amount} coins`}
        </button>
        {result && <button className="btn" onClick={() => setResult(null)} style={{ marginLeft:12, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>Again</button>}
      </div>
    </div>
  );
}
