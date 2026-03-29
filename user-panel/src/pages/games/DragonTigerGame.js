import { useState, useEffect } from "react";
import { settleGame, fetchBalance } from "../../services/gameApi";

const SUITS = ["♠","♥","♦","♣"];
const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const RANK_VAL = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14};
const RED = ["♥","♦"];

function drawCard() {
  const s = SUITS[Math.floor(Math.random() * 4)];
  const r = RANKS[Math.floor(Math.random() * 13)];
  return { r, s };
}

function Card({ c, size = "md" }) {
  const red = RED.includes(c.s);
  const w = size==="lg" ? 72 : 52, h = size==="lg" ? 100 : 72;
  return (
    <div style={{ width:w, height:h, borderRadius:8, background:"#fff", border:"1px solid #ddd", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, boxShadow:"0 3px 10px rgba(0,0,0,0.4)", flexShrink:0 }}>
      <span style={{ fontSize:size==="lg"?20:14, fontWeight:800, color:red?"#e74c3c":"#0b0f1a", lineHeight:1 }}>{c.r}</span>
      <span style={{ fontSize:size==="lg"?26:18, color:red?"#e74c3c":"#0b0f1a", lineHeight:1 }}>{c.s}</span>
    </div>
  );
}

const STAKES = [50, 100, 200, 500, 1000];

export default function DragonTigerGame({ setPage }) {
  const [bal, setBal] = useState(0);
  const [stake, setStake] = useState(100);
  const [bet, setBet] = useState(null); // "dragon" | "tiger" | "tie"
  const [dragon, setDragon] = useState(null);
  const [tiger, setTiger] = useState(null);
  const [won, setWon] = useState(null);
  const [phase, setPhase] = useState("bet");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchBalance().then(setBal); }, []);

  const play = async () => {
    if (!bet) return setMsg("Place your bet first!");
    if (stake > bal) return setMsg("Insufficient balance!");
    setLoading(true); setMsg("");

    const d = drawCard(), t = drawCard();
    setDragon(d); setTiger(t);

    const dv = RANK_VAL[d.r], tv = RANK_VAL[t.r];
    const winner = dv > tv ? "dragon" : tv > dv ? "tiger" : "tie";
    const playerWon = winner === bet;
    const isTie = winner === "tie" && bet !== "tie";

    // Payouts: Dragon/Tiger 1:1, Tie 8:1 (like Evolution Dragon Tiger)
    let winAmt = 0;
    if (bet === "tie" && winner === "tie") winAmt = stake * 9; // 8:1 + stake
    else if (playerWon) winAmt = stake * 2;
    else if (isTie) winAmt = Math.floor(stake * 0.5); // lose half on tie

    const settled = await settleGame("dragonTiger", stake, playerWon || (bet==="tie"&&winner==="tie"), winAmt);
    if (settled.success) {
      setBal(settled.balance);
      setWon(playerWon);
      if (winner==="tie" && bet!=="tie") setMsg(`🤝 Tie! Lost ₹${Math.floor(stake*0.5)}`);
      else if (bet==="tie" && winner==="tie") setMsg(`🎉 Tie wins! +₹${winAmt-stake}`);
      else setMsg(playerWon ? `🎉 ${bet.charAt(0).toUpperCase()+bet.slice(1)} Wins! +₹${stake}` : `💸 ${winner.charAt(0).toUpperCase()+winner.slice(1)} wins. -₹${stake}`);
    } else { setMsg("❌ " + (settled.error||"Error")); }
    setPhase("result"); setLoading(false);
  };

  const reset = () => { setPhase("bet"); setBet(null); setDragon(null); setTiger(null); setWon(null); setMsg(""); };

  return (
    <div style={{ background: "#0d1a0d", minHeight:"100%", margin:-20, padding:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={() => setPage("games")} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", padding:"6px 14px", borderRadius:6, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
          <span style={{ fontSize:20, fontWeight:800, color:"#F2B824" }}>🐉 Dragon Tiger</span>
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:"#F2B824", background:"rgba(0,0,0,0.3)", padding:"6px 16px", borderRadius:20 }}>🪙 {bal.toLocaleString()}</div>
      </div>

      <div style={{ maxWidth:580, margin:"0 auto" }}>
        {/* Cards area */}
        <div style={{ display:"flex", gap:20, justifyContent:"center", marginBottom:24 }}>
          {/* Dragon side */}
          <div style={{ flex:1, textAlign:"center", background: bet==="dragon"?"rgba(231,76,60,0.12)":"rgba(255,255,255,0.04)", border:`2px solid ${bet==="dragon"?"#e74c3c":"rgba(255,255,255,0.08)"}`, borderRadius:12, padding:"20px 16px" }}>
            <div style={{ fontSize:24, marginBottom:8 }}>🐉</div>
            <div style={{ fontSize:13, fontWeight:800, color:"#e74c3c", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Dragon</div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              {dragon ? <Card c={dragon} size="lg" /> : <div style={{ width:72, height:100, borderRadius:8, background:"rgba(255,255,255,0.05)", border:"2px dashed rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🂠</div>}
            </div>
            {dragon && <div style={{ marginTop:8, fontSize:12, color:"#a8b4cc" }}>{dragon.r} of {dragon.s}</div>}
          </div>

          {/* VS */}
          <div style={{ display:"flex", alignItems:"center" }}>
            <span style={{ fontSize:18, fontWeight:800, color:"#F2B824" }}>VS</span>
          </div>

          {/* Tiger side */}
          <div style={{ flex:1, textAlign:"center", background: bet==="tiger"?"rgba(242,184,36,0.10)":"rgba(255,255,255,0.04)", border:`2px solid ${bet==="tiger"?"#F2B824":"rgba(255,255,255,0.08)"}`, borderRadius:12, padding:"20px 16px" }}>
            <div style={{ fontSize:24, marginBottom:8 }}>🐯</div>
            <div style={{ fontSize:13, fontWeight:800, color:"#F2B824", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Tiger</div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              {tiger ? <Card c={tiger} size="lg" /> : <div style={{ width:72, height:100, borderRadius:8, background:"rgba(255,255,255,0.05)", border:"2px dashed rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🂠</div>}
            </div>
            {tiger && <div style={{ marginTop:8, fontSize:12, color:"#a8b4cc" }}>{tiger.r} of {tiger.s}</div>}
          </div>
        </div>

        {/* Result */}
        {msg && (
          <div style={{ textAlign:"center", padding:"12px 20px", borderRadius:10, marginBottom:16, background:won?"rgba(46,204,113,0.1)":"rgba(231,76,60,0.1)", border:`1px solid ${won?"#2ecc71":"#e74c3c"}`, fontSize:16, fontWeight:800, color:won?"#2ecc71":"#e74c3c" }}>
            {msg}
          </div>
        )}

        {/* Bet buttons */}
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {[["dragon","🐉 Dragon","#e74c3c"], ["tie","🤝 Tie (8:1)","#F2B824"], ["tiger","Tiger 🐯","#F2B824"]].map(([b, label, col]) => (
            <button key={b} onClick={() => { if(phase==="bet") setBet(b); }}
              style={{ flex:1, padding:"12px 6px", borderRadius:8, border:`2px solid ${bet===b?col:"rgba(255,255,255,0.1)"}`, cursor:"pointer", fontFamily:"inherit", fontWeight:800, fontSize:13, background:bet===b?`rgba(${b==="dragon"?"231,76,60":"242,184,36"},0.15)`:"rgba(255,255,255,0.05)", color:bet===b?col:"#a8b4cc" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Stakes */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
          {STAKES.map(s => (
            <button key={s} onClick={() => { if(phase==="bet") setStake(s); }}
              style={{ padding:"7px 14px", borderRadius:6, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:13, background:stake===s?"#F2B824":"rgba(255,255,255,0.1)", color:stake===s?"#0b0f1a":"#f0f4ff" }}>
              ₹{s}
            </button>
          ))}
        </div>

        {phase === "bet" ? (
          <button onClick={play} disabled={loading||!bet}
            style={{ width:"100%", padding:"14px", background:!bet?"rgba(242,184,36,0.3)":"#F2B824", border:"none", borderRadius:8, fontSize:16, fontWeight:800, cursor:!bet||loading?"not-allowed":"pointer", color:"#0b0f1a", fontFamily:"inherit" }}>
            {loading?"Dealing...":!bet?"Choose a Side":"Deal Cards"}
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
