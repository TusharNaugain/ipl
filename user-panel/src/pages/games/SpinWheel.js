import { useState } from "react";
import { playSpin } from "../../services/gameEngine";

const SEGMENTS = [
  { label:"2x",  color:"#6c63ff" }, { label:"0x", color:"#ff6584" },
  { label:"3x",  color:"#43e97b" }, { label:"0x", color:"#ff6584" },
  { label:"5x",  color:"#ffc700" }, { label:"0x", color:"#ff6584" },
  { label:"1x",  color:"#63b3ff" }, { label:"10x",color:"#ff9f43" },
];

export default function SpinWheel({ setPage }) {
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState("");

  const spin = () => {
    if (amount < 10) return setError("Minimum 10 coins");
    setSpinning(true); setError(""); setResult(null);
    setRotation(prev => prev + 5*360 + Math.random()*360);
    setTimeout(() => {
      try { setResult(playSpin(amount)); }
      catch (e) { setError(e.message); }
      setSpinning(false);
    }, 3000);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>← Back</button>
        <div><div style={{ fontSize:24, fontWeight:700 }}>🎰 Spin Wheel</div><div style={{ fontSize:13, color:"var(--text-3)" }}>Win up to 10x your bet!</div></div>
      </div>
      <div className="card" style={{ textAlign:"center" }}>
        <div style={{ display:"inline-block", position:"relative", marginBottom:28 }}>
          <div style={{ width:220, height:220, borderRadius:"50%",
            background:`conic-gradient(${SEGMENTS.map((s,i) => `${s.color} ${i*(360/SEGMENTS.length)}deg ${(i+1)*(360/SEGMENTS.length)}deg`).join(", ")})`,
            transform:`rotate(${rotation}deg)`, transition:spinning?"transform 3s cubic-bezier(0.17,0.67,0.12,0.99)":"none",
            border:"4px solid var(--bg-base)", boxShadow:"0 0 0 6px var(--border), 0 8px 32px rgba(0,0,0,0.4)" }} />
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:48, height:48, borderRadius:"50%", background:"var(--bg-base)", border:"3px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🎯</div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginBottom:24 }}>
          {[...new Set(SEGMENTS.map(s=>s.label))].map(label => {
            const seg = SEGMENTS.find(s=>s.label===label);
            return <span key={label} className="badge" style={{ background:seg.color+"22", color:seg.color, border:`1px solid ${seg.color}44` }}>{label}</span>;
          })}
        </div>
        {error && <div className="error-msg" style={{ marginBottom:16 }}>⚠️ {error}</div>}
        {result && <div style={{ marginBottom:20, padding:"16px", background:"var(--bg-surface)", borderRadius:12, border:"1px solid var(--border)" }}>
          <div style={{ fontSize:28, fontWeight:700, color:result.won?"#43e97b":"#ff6584" }}>
            {result.segment} — {result.won ? `🎉 +${result.payout} coins!` : "Better luck next time"}
          </div>
          <div style={{ color:"var(--text-3)", marginTop:4 }}>Balance: 🪙 {result.coins}</div>
        </div>}
        <div className="form-group" style={{ maxWidth:240, margin:"0 auto 20px" }}>
          <label>Bet Amount</label>
          <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} disabled={spinning} />
          <div style={{ display:"flex", gap:8, marginTop:8, justifyContent:"center" }}>
            {[50,100,500].map(v => <button key={v} className="btn" onClick={() => setAmount(v)} disabled={spinning} style={{ padding:"4px 10px", fontSize:12, background:"var(--bg-hover)", border:"1px solid var(--border)", color:"var(--text-2)" }}>{v}</button>)}
          </div>
        </div>
        <button className="btn btn-primary" onClick={spin} disabled={spinning} style={{ minWidth:200, fontSize:15 }}>
          {spinning ? "🎰 Spinning..." : `Spin — ${amount} coins`}
        </button>
      </div>
    </div>
  );
}
