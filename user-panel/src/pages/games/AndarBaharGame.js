import { useState, useEffect } from "react";
import { settleGame, fetchBalance } from "../../services/gameApi";

const SUITS = ["♠","♥","♦","♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const RED = ["♥","♦"];

function newDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ r, s });
  return d.sort(() => Math.random() - 0.5);
}

function Card({ c, faceDown }) {
  if (faceDown) return (
    <div style={{ width: 44, height: 62, borderRadius: 5, background: "linear-gradient(135deg,#1a1060,#3a2090)", border: "2px solid #5a40b0", flexShrink: 0, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>🂠</div>
  );
  const red = RED.includes(c.s);
  return (
    <div style={{ width: 44, height: 62, borderRadius: 5, background: "#fff", border: "1px solid #ddd", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: red?"#e74c3c":"#0b0f1a", lineHeight: 1 }}>{c.r}</span>
      <span style={{ fontSize: 16, color: red?"#e74c3c":"#0b0f1a", lineHeight: 1 }}>{c.s}</span>
    </div>
  );
}

const STAKES = [50, 100, 200, 500, 1000];

export default function AndarBaharGame({ setPage }) {
  const [bal, setBal] = useState(0);
  const [stake, setStake] = useState(100);
  const [bet, setBet] = useState(null); // "andar" | "bahar"
  const [phase, setPhase] = useState("choose"); // choose | result
  const [joker, setJoker] = useState(null);
  const [andar, setAndar] = useState([]);
  const [bahar, setBahar] = useState([]);
  const [won, setWon] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchBalance().then(setBal); }, []);

  const play = async () => {
    if (!bet) return setMsg("Choose Andar or Bahar first!");
    if (stake > bal) return setMsg("Insufficient balance!");
    setLoading(true); setMsg("");
    const deck = newDeck();
    const jk = deck.shift(); // Joker card
    setJoker(jk);

    const andarArr = [], baharArr = [];
    let side = "andar"; // andar gets first card
    let winner = null;
    for (let i = 0; i < deck.length; i++) {
      const card = deck[i];
      if (side === "andar") {
        andarArr.push(card);
        if (card.r === jk.r) { winner = "andar"; break; }
        side = "bahar";
      } else {
        baharArr.push(card);
        if (card.r === jk.r) { winner = "bahar"; break; }
        side = "andar";
      }
    }

    setAndar([...andarArr]); setBahar([...baharArr]);
    const playerWon = winner === bet;
    // Andar pays 0.9:1 (house edge), Bahar pays 1:1
    const multiplier = bet === "andar" ? 1.9 : 2;
    const winAmt = playerWon ? Math.floor(stake * multiplier) : 0;

    const res = await settleGame("andarBahar", stake, playerWon, winAmt);
    if (res.success) {
      setBal(res.balance);
      setWon(playerWon);
      setMsg(playerWon ? `🎉 ${bet.toUpperCase()} Wins! +₹${winAmt - stake}` : `💸 ${winner.toUpperCase()} won. -₹${stake}`);
    } else { setMsg("❌ " + (res.error || "Error")); }
    setPhase("result"); setLoading(false);
  };

  const reset = () => { setPhase("choose"); setBet(null); setJoker(null); setAndar([]); setBahar([]); setWon(null); setMsg(""); };

  const CardRow = ({ cards, label, highlight }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: highlight ? "#F2B824" : "#a8b4cc", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {cards.map((c, i) => <Card key={i} c={c} />)}
        {cards.length === 0 && <span style={{ color: "#5a6a85", fontSize: 12 }}>Waiting...</span>}
      </div>
    </div>
  );

  return (
    <div style={{ background: "#1a0a2e", minHeight: "100%", margin: -20, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setPage("games")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#F2B824" }}>🃏 Andar Bahar</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#F2B824", background: "rgba(0,0,0,0.3)", padding: "6px 16px", borderRadius: 20 }}>🪙 {bal.toLocaleString()}</div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Joker card */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#a8b4cc", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Joker Card</div>
          <div style={{ display: "inline-block" }}>
            {joker ? <Card c={joker} /> : <Card c={{r:"?",s:"★"}} />}
          </div>
        </div>

        {/* Card rows */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardRow cards={andar} label={`Andar (Inside) ${bet==="andar"?"← Your bet":""}`} highlight={bet==="andar"} />
          <CardRow cards={bahar} label={`Bahar (Outside) ${bet==="bahar"?"← Your bet":""}`} highlight={bet==="bahar"} />
        </div>

        {/* Result */}
        {msg && (
          <div style={{ textAlign:"center", padding:"12px 20px", borderRadius:10, marginBottom:16, background: won?"rgba(46,204,113,0.1)":"rgba(231,76,60,0.1)", border:`1px solid ${won?"#2ecc71":"#e74c3c"}`, fontSize:16, fontWeight:800, color:won?"#2ecc71":"#e74c3c" }}>
            {msg}
          </div>
        )}

        {/* Bet selection */}
        {phase === "choose" && (
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            {["andar","bahar"].map(b => (
              <button key={b} onClick={() => setBet(b)}
                style={{ flex:1, padding:"16px", borderRadius:8, border: bet===b?"2px solid #F2B824":"2px solid rgba(255,255,255,0.1)", cursor:"pointer", fontFamily:"inherit", fontWeight:800, fontSize:15, background:bet===b?"rgba(242,184,36,0.15)":"rgba(255,255,255,0.05)", color:bet===b?"#F2B824":"#a8b4cc", textTransform:"uppercase" }}>
                {b === "andar" ? "⬅ Andar" : "Bahar ➡"}
              </button>
            ))}
          </div>
        )}

        {/* Stakes */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
          {STAKES.map(s => (
            <button key={s} onClick={() => { if(phase==="choose") setStake(s); }}
              style={{ padding:"7px 14px", borderRadius:6, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:13, background:stake===s?"#F2B824":"rgba(255,255,255,0.1)", color:stake===s?"#0b0f1a":"#f0f4ff" }}>
              ₹{s}
            </button>
          ))}
        </div>

        {phase === "choose" ? (
          <button onClick={play} disabled={loading || !bet}
            style={{ width:"100%", padding:"14px", background: !bet?"rgba(242,184,36,0.3)":"#F2B824", border:"none", borderRadius:8, fontSize:16, fontWeight:800, cursor:!bet||loading?"not-allowed":"pointer", color:"#0b0f1a", fontFamily:"inherit" }}>
            {loading ? "Dealing..." : `Play — ₹${stake}`}
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
