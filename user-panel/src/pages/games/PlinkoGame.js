import { useState } from "react";
import { playPlinko } from "../../services/gameEngine";

const SLOTS = [0.2,0.5,1,1.5,2,3,5,10,5,3,2,1.5,1,0.5,0.2];

export default function PlinkoGame({ setPage }) {
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [dropping, setDropping] = useState(false);
  const [error, setError] = useState("");

  const play = () => {
    setDropping(true); setError(""); setResult(null);
    setTimeout(() => {
      try { setResult(playPlinko(amount)); }
      catch (e) { setError(e.message); }
      setDropping(false);
    }, 1200);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>← Back</button>
        <div><div style={{ fontSize:24, fontWeight:700 }}>🔵 Plinko</div><div style={{ fontSize:13, color:"var(--text-3)" }}>Drop the ball, win up to 10x!</div></div>
      </div>
      <div className="card" style={{ textAlign:"center" }}>
        {dropping && <div style={{ fontSize:40, animation:"falling 1.2s ease-in", marginBottom:16 }}>🔵</div>}
        {result && <div style={{ marginBottom:20, padding:20, background:"var(--bg-surface)", borderRadius:14 }}>
          <div style={{ fontSize:48, fontWeight:800, color:result.won?"#43e97b":"#ff6584" }}>{result.multiplier}x</div>
          <div style={{ fontSize:18, fontWeight:700, color:result.won?"#43e97b":"#ff6584", marginTop:8 }}>
            {result.multiplier > 1 ? `🎉 +${result.payout} coins!` : result.multiplier===1 ? `Returned ${result.payout} coins` : "0x — No payout"}
          </div>
          <div style={{ color:"var(--text-3)", marginTop:4 }}>Balance: 🪙 {result.coins}</div>
        </div>}
        {error && <div className="error-msg" style={{ marginBottom:12 }}>⚠️ {error}</div>}
        <div style={{ display:"flex", gap:4, justifyContent:"center", marginBottom:24 }}>
          {SLOTS.map((s,i) => (
            <div key={i} style={{ width:40, padding:"8px 2px", borderRadius:8, background:result&&result.slot===i?"rgba(108,99,255,0.3)":"var(--bg-hover)", border:`1px solid ${result&&result.slot===i?"var(--accent)":"var(--border)"}`, textAlign:"center", fontSize:10, color:"var(--text-2)", fontWeight:600 }}>
              {s}x
            </div>
          ))}
        </div>
        <div className="form-group" style={{ maxWidth:200, margin:"0 auto 16px" }}>
          <label>Bet Amount</label>
          <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} disabled={dropping} />
          <div style={{ display:"flex", gap:6, marginTop:6, justifyContent:"center" }}>
            {[50,100,500].map(v => <button key={v} className="btn" onClick={() => setAmount(v)} style={{ padding:"3px 10px", fontSize:11, background:"var(--bg-hover)", border:"1px solid var(--border)", color:"var(--text-2)" }}>{v}</button>)}
          </div>
        </div>
        <button className="btn btn-primary" onClick={play} disabled={dropping} style={{ minWidth:200 }}>
          {dropping ? "🔵 Dropping..." : `Drop — ${amount} coins`}
        </button>
        {result && <button className="btn" onClick={() => setResult(null)} style={{ marginLeft:12, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>Again</button>}
      </div>
    </div>
  );
}
