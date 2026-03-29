import { useState } from "react";
import { playHiLo } from "../../services/gameEngine";

export default function HiLoGame({ setPage }) {
  const [pick, setPick] = useState(null);
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const play = () => {
    if (!pick) return setError("Pick Higher or Lower!");
    setLoading(true); setError(""); setResult(null);
    setTimeout(() => {
      try { setResult(playHiLo(pick, amount)); }
      catch (e) { setError(e.message); }
      setLoading(false);
    }, 800);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>← Back</button>
        <div><div style={{ fontSize:24, fontWeight:700 }}>📊 Hi-Lo</div><div style={{ fontSize:13, color:"var(--text-3)" }}>Will the next card be Higher or Lower? — 1.8x</div></div>
      </div>
      <div className="card" style={{ textAlign:"center" }}>
        {result && <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"center", gap:24, marginBottom:16 }}>
            <div style={{ padding:"20px 30px", background:"var(--bg-surface)", borderRadius:14, border:"1px solid var(--border)" }}>
              <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:4 }}>Base Card</div>
              <div style={{ fontSize:40, fontWeight:700 }}>{result.baseCard}</div>
            </div>
            <div style={{ fontSize:28, alignSelf:"center", color:"var(--text-3)" }}>→</div>
            <div style={{ padding:"20px 30px", background:result.won?"rgba(67,233,123,0.1)":"rgba(255,101,132,0.1)", borderRadius:14, border:`1px solid ${result.won?"rgba(67,233,123,0.3)":"rgba(255,101,132,0.3)"}` }}>
              <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:4 }}>Next Card</div>
              <div style={{ fontSize:40, fontWeight:700 }}>{result.nextCard}</div>
            </div>
          </div>
          <div style={{ fontSize:22, fontWeight:700, color:result.won?"#43e97b":"#ff6584" }}>
            {result.won ? `🎉 +${result.payout} coins!` : "Wrong guess!"}
          </div>
          <div style={{ color:"var(--text-3)", marginTop:4 }}>Balance: 🪙 {result.coins}</div>
        </div>}
        {!result && <div style={{ fontSize:36, marginBottom:24, color:"var(--text-3)" }}>🃏 ?</div>}
        {error && <div className="error-msg" style={{ marginBottom:12 }}>⚠️ {error}</div>}
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginBottom:24 }}>
          {[{id:"hi",label:"Higher ⬆",color:"#43e97b"},{id:"lo",label:"Lower ⬇",color:"#ff6584"}].map(opt => (
            <button key={opt.id} className="btn" onClick={() => setPick(opt.id)}
              style={{ padding:"16px 32px", fontSize:16, fontWeight:700, background:pick===opt.id?opt.color+"22":"var(--bg-surface)", color:pick===opt.id?opt.color:"var(--text-2)", border:`2px solid ${pick===opt.id?opt.color:"var(--border)"}` }}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="form-group" style={{ maxWidth:200, margin:"0 auto 16px" }}>
          <label>Bet Amount</label>
          <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={play} disabled={loading||!pick} style={{ minWidth:200 }}>
          {loading ? "Dealing..." : `Play — ${amount} coins`}
        </button>
        {result && <button className="btn" onClick={() => { setResult(null); setPick(null); }} style={{ marginLeft:12, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>Again</button>}
      </div>
    </div>
  );
}
