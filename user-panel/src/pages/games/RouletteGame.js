import { useState } from "react";
import { playRoulette } from "../../services/gameEngine";

const RED_NUMS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const BET_MODES = [
  { id:"color",   label:"🔴 Red/Black", options:["red","black"],   mult:"1.9x" },
  { id:"oddeven", label:"🔢 Odd/Even",  options:["odd","even"],    mult:"1.9x" },
  { id:"half",    label:"↕ Half",       options:["1-18","19-36"], mult:"1.9x" },
  { id:"dozen",   label:"📊 Dozen",     options:["1","2","3"],    mult:"2.8x" },
];

export default function RouletteGame({ setPage }) {
  const [betType, setBetType] = useState("color");
  const [betValue, setBetValue] = useState("");
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState("");

  const play = () => {
    if (!betValue) return setError("Select a bet!");
    setSpinning(true); setError(""); setResult(null);
    setTimeout(() => {
      try { setResult(playRoulette(betType, betValue, amount)); }
      catch (e) { setError(e.message); }
      setSpinning(false);
    }, 1500);
  };

  const getNumColor = n => n===0?"#43e97b":RED_NUMS.includes(n)?"#ff6584":"#555";

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>← Back</button>
        <div><div style={{ fontSize:24, fontWeight:700 }}>🎰 Roulette</div><div style={{ fontSize:13, color:"var(--text-3)" }}>European Roulette — up to 35x</div></div>
      </div>
      <div className="card" style={{ textAlign:"center" }}>
        {spinning && <div style={{ fontSize:48, marginBottom:16, animation:"spin 0.3s linear infinite" }}>🎰</div>}
        {result && <div style={{ marginBottom:24, padding:20, background:"var(--bg-surface)", borderRadius:14 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:getNumColor(result.result), display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:700, color:"#fff", marginBottom:12, border:"4px solid var(--border)" }}>{result.result}</div>
          <div style={{ fontSize:18, fontWeight:700, color:result.won?"#43e97b":"#ff6584" }}>
            {result.won ? `🎉 +${result.payout} coins!` : `${result.resultColor.toUpperCase()} — Better luck!`}
          </div>
          <div style={{ color:"var(--text-3)", marginTop:4 }}>Balance: 🪙 {result.coins}</div>
        </div>}
        {error && <div className="error-msg" style={{ marginBottom:12 }}>⚠️ {error}</div>}
        <div style={{ display:"flex", gap:6, marginBottom:16, justifyContent:"center", flexWrap:"wrap" }}>
          {BET_MODES.map(m => (
            <button key={m.id} onClick={() => { setBetType(m.id); setBetValue(""); }} className="btn"
              style={{ padding:"8px 14px", fontSize:12, background:betType===m.id?"var(--accent)":"var(--bg-surface)", color:betType===m.id?"#fff":"var(--text-2)", border:`1px solid ${betType===m.id?"var(--accent)":"var(--border)"}` }}>
              {m.label} ({m.mult})
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:20, flexWrap:"wrap" }}>
          {BET_MODES.find(m=>m.id===betType)?.options.map(opt => (
            <button key={opt} onClick={() => setBetValue(opt)} className="btn"
              style={{ padding:"12px 24px", fontSize:14, fontWeight:600, textTransform:"capitalize", background:betValue===opt?"var(--accent)":"var(--bg-hover)", color:betValue===opt?"#fff":"var(--text-1)", border:`2px solid ${betValue===opt?"var(--accent)":"var(--border)"}` }}>
              {opt==="1"?"1-12":opt==="2"?"13-24":opt==="3"?"25-36":opt}
            </button>
          ))}
        </div>
        <div className="form-group" style={{ maxWidth:200, margin:"0 auto 16px" }}>
          <label>Bet Amount</label>
          <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={play} disabled={spinning||!betValue} style={{ minWidth:200 }}>
          {spinning ? "Spinning..." : `🎰 Spin — ${amount} coins`}
        </button>
        {result && <button className="btn" onClick={() => { setResult(null); setBetValue(""); }} style={{ marginLeft:12, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-2)" }}>Again</button>}
      </div>
    </div>
  );
}
