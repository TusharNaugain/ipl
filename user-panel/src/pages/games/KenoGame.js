import { useState, useEffect } from "react";
import { settleGame, fetchBalance } from "../../services/gameApi";

const ALL_NUMS = Array.from({ length: 40 }, (_, i) => i + 1);
const STAKES = [50, 100, 200, 500, 1000];
const PAYOUTS = {
  1:[0,3.5], 2:[0,0,6], 3:[0,0,2,20], 4:[0,0,1,5,60],
  5:[0,0,1,3,15,200], 6:[0,0,1,2,5,30,400], 7:[0,0,1,1,4,15,100,700],
  8:[0,0,0,1,3,10,50,200,1000], 9:[0,0,0,1,2,6,25,100,500,2000],
  10:[0,0,0,1,2,4,15,50,200,1000,5000],
};

function drawWinning() {
  return new Set([...ALL_NUMS].sort(()=>Math.random()-0.5).slice(0,20));
}

export default function KenoGame({ setPage }) {
  const [bal, setBal] = useState(0);
  const [stake, setStake] = useState(100);
  const [picks, setPicks] = useState(new Set());
  const [winning, setWinning] = useState(new Set());
  const [phase, setPhase] = useState("pick");
  const [hits, setHits] = useState(0);
  const [payout, setPayout] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchBalance().then(setBal); }, []);

  const togglePick = (n) => {
    if (phase !== "pick") return;
    setPicks(prev => {
      const next = new Set(prev);
      if (next.has(n)) { next.delete(n); return next; }
      if (next.size >= 10) return prev;
      next.add(n); return next;
    });
  };

  const play = async () => {
    if (picks.size < 1) return setMsg("Pick at least 1 number!");
    if (stake > bal) return setMsg("Insufficient balance!");
    setLoading(true); setMsg("");
    const w = drawWinning();
    setWinning(w); setPhase("reveal");

    let h = 0;
    picks.forEach(p => { if (w.has(p)) h++; });
    const pay = PAYOUTS[picks.size]?.[h] ?? 0;
    const winAmt = Math.floor(stake * pay);
    const won = winAmt > 0;

    await new Promise(r => setTimeout(r, 1200));
    const res = await settleGame("keno", stake, won, winAmt);
    if (res.success) {
      setBal(res.balance); setHits(h); setPayout(winAmt);
      setMsg(won ? `🎉 ${h} hits! Win: ₹${winAmt}` : `😔 ${h} hits. -₹${stake}`);
    } else { setMsg("❌ " + (res.error||"Error")); }
    setPhase("result"); setLoading(false);
  };

  const reset = () => { setPhase("pick"); setPicks(new Set()); setWinning(new Set()); setHits(0); setPayout(0); setMsg(""); };

  const getStyle = (n) => {
    if (phase !== "pick") {
      if (picks.has(n) && winning.has(n)) return { background:"#2ecc71", color:"#fff", border:"2px solid #27ae60" };
      if (picks.has(n)) return { background:"rgba(231,76,60,0.3)", color:"#e74c3c", border:"2px solid #e74c3c" };
      if (winning.has(n)) return { background:"rgba(255,255,255,0.07)", color:"#3a4a5a", border:"1px solid rgba(255,255,255,0.08)" };
    }
    if (picks.has(n)) return { background:"#F2B824", color:"#0b0f1a", border:"2px solid #F2B824" };
    return { background:"rgba(255,255,255,0.06)", color:"#a8b4cc", border:"1px solid rgba(255,255,255,0.1)" };
  };

  return (
    <div style={{ background:"#0a0a1a", minHeight:"100%", margin:-20, padding:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={()=>setPage("games")} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", padding:"6px 14px", borderRadius:6, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
          <span style={{ fontSize:20, fontWeight:800, color:"#F2B824" }}>🎟️ Keno</span>
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:"#F2B824", background:"rgba(0,0,0,0.3)", padding:"6px 16px", borderRadius:20 }}>🪙 {bal.toLocaleString()}</div>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          {[["Picks", picks.size+"/10"], ["Stake","₹"+stake], ["Max Win", picks.size>0?"₹"+(stake*(PAYOUTS[picks.size]?.at(-1)||0)):"—"]].map(([l,v])=>(
            <div key={l} style={{ flex:1, background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"10px 12px", textAlign:"center", border:"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize:10, color:"#5a6a85", fontWeight:700, textTransform:"uppercase" }}>{l}</div>
              <div style={{ fontSize:15, fontWeight:800, color:"#F2B824", marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:5, marginBottom:14 }}>
          {ALL_NUMS.map(n => (
            <button key={n} onClick={()=>togglePick(n)}
              style={{ ...getStyle(n), aspectRatio:"1", borderRadius:6, cursor:phase==="pick"?"pointer":"default", fontFamily:"inherit", fontWeight:700, fontSize:13, transition:"all 0.12s", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {n}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ textAlign:"center", padding:"12px", borderRadius:10, marginBottom:12, background:payout>0?"rgba(46,204,113,0.1)":"rgba(231,76,60,0.08)", border:`1px solid ${payout>0?"#2ecc71":"#e74c3c"}`, fontSize:15, fontWeight:800, color:payout>0?"#2ecc71":"#e74c3c" }}>
            {msg}
          </div>
        )}

        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          {STAKES.map(s=>(
            <button key={s} onClick={()=>{ if(phase==="pick") setStake(s); }}
              style={{ padding:"7px 14px", borderRadius:6, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:13, background:stake===s?"#F2B824":"rgba(255,255,255,0.1)", color:stake===s?"#0b0f1a":"#f0f4ff" }}>
              ₹{s}
            </button>
          ))}
        </div>

        {phase === "pick" ? (
          <button onClick={play} disabled={loading||picks.size<1}
            style={{ width:"100%", padding:"14px", background:picks.size<1?"rgba(242,184,36,0.3)":"#F2B824", border:"none", borderRadius:8, fontSize:16, fontWeight:800, cursor:picks.size<1||loading?"not-allowed":"pointer", color:"#0b0f1a", fontFamily:"inherit" }}>
            {picks.size<1?"Pick numbers to play":`Play ₹${stake}`}
          </button>
        ) : phase === "reveal" ? (
          <button disabled style={{ width:"100%", padding:"14px", background:"rgba(242,184,36,0.3)", border:"none", borderRadius:8, fontSize:16, fontWeight:800, color:"#F2B824", fontFamily:"inherit" }}>
            Drawing…
          </button>
        ) : (
          <button onClick={reset} style={{ width:"100%", padding:"14px", background:"#2ecc71", border:"none", borderRadius:8, fontSize:16, fontWeight:800, cursor:"pointer", color:"#0b0f1a", fontFamily:"inherit" }}>
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
