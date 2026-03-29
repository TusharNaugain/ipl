import { useState } from "react";
import { playCoinFlip } from "../../services/gameEngine";

export default function CoinFlipGame({ setPage }) {
  const [pick, setPick] = useState(null);
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [error, setError] = useState("");

  const play = () => {
    if (!pick) return setError("Pick Heads or Tails!");
    setFlipping(true); setError(""); setResult(null);
    setTimeout(() => {
      try { setResult(playCoinFlip(pick, amount)); }
      catch (e) { setError(e.message); }
      setFlipping(false);
    }, 1000);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>← Back</button>
        <div><div style={{ fontSize:24, fontWeight:700 }}>🪙 Coin Flip</div><div style={{ fontSize:13, color:"var(--text-3)" }}>Heads or Tails — 1.9x</div></div>
      </div>
      <div className="card" style={{ textAlign:"center" }}>
        <div style={{ fontSize:80, marginBottom:16, display:"inline-block", animation:flipping?"spin 0.15s linear infinite":"none" }}>
          {result ? (result.result==="heads" ? "🪙" : "⭕") : "🪙"}
        </div>
        {result && <div style={{ fontSize:22, fontWeight:700, color:result.won?"#43e97b":"#ff6584", marginBottom:8 }}>
          {result.won ? `🎉 +${result.payout} coins!` : `${result.result.toUpperCase()} — You lose`}
        </div>}
        {result && <div style={{ color:"var(--text-3)", marginBottom:16 }}>Balance: 🪙 {result.coins}</div>}
        {error && <div className="error-msg" style={{ marginBottom:12 }}>⚠️ {error}</div>}
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginBottom:24 }}>
          {[{id:"heads",label:"Heads 🪙"},{id:"tails",label:"Tails ⭕"}].map(side => (
            <div key={side.id} onClick={() => !flipping && setPick(side.id)}
              style={{ width:130, padding:"20px", borderRadius:14, cursor:"pointer", textAlign:"center", background:pick===side.id?"rgba(108,99,255,0.15)":"var(--bg-surface)", border:`2px solid ${pick===side.id?"var(--accent)":"var(--border)"}`, transition:"all 0.2s" }}>
              <div style={{ fontSize:36, marginBottom:6 }}>{side.id==="heads"?"🪙":"⭕"}</div>
              <div style={{ fontWeight:600, color:pick===side.id?"var(--accent)":"var(--text-2)" }}>{side.label}</div>
            </div>
          ))}
        </div>
        <div className="form-group" style={{ maxWidth:200, margin:"0 auto 16px" }}>
          <label>Bet Amount</label>
          <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} />
          <div style={{ display:"flex", gap:6, marginTop:6, justifyContent:"center" }}>
            {[50,100,500,1000].map(v => <button key={v} className="btn" onClick={() => setAmount(v)} style={{ padding:"3px 10px", fontSize:11, background:"var(--bg-hover)", border:"1px solid var(--border)", color:"var(--text-2)" }}>{v}</button>)}
          </div>
        </div>
        <button className="btn btn-primary" onClick={play} disabled={flipping||!pick} style={{ minWidth:200 }}>
          {flipping ? "🪙 Flipping..." : `Flip — ${amount} coins`}
        </button>
        {result && <button className="btn" onClick={() => { setResult(null); setPick(null); }} style={{ marginLeft:12, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>Again</button>}
      </div>
    </div>
  );
}
