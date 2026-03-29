import { useState, useEffect } from "react";
import { settleGame, fetchBalance } from "../../services/gameApi";

/* ── Card helpers ─────────────────────────────────────────────────────────── */
const SUITS = ["♠","♥","♦","♣"];
const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const RANK_VAL = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14};
const RED = ["♥","♦"];

function newDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ r, s });
  return d.sort(() => Math.random() - 0.5);
}

function deal3(deck) { return [deck.splice(0,3), deck.splice(0,3), deck.splice(0,3)]; }

function handScore(cards) {
  // Simplified Teen Patti ranking: 0=high card, 1=pair, 2=flush, 3=sequence, 4=seq flush, 5=trio
  const vals = cards.map(c => RANK_VAL[c.r]).sort((a,b) => b-a);
  const suits = cards.map(c => c.s);
  const isFlush = suits.every(s => s === suits[0]);
  const isPair = vals[0]===vals[1] || vals[1]===vals[2];
  const isTrio = vals[0]===vals[1] && vals[1]===vals[2];
  const seqCheck = (v) => (v[0]-v[1]===1 && v[1]-v[2]===1) || (v[0]===14&&v[1]===3&&v[2]===2);
  const isSeq = seqCheck(vals);
  if (isTrio) return [5, vals[0]];
  if (isSeq && isFlush) return [4, vals[0]];
  if (isFlush) return [2, vals[0]];
  if (isSeq) return [3, vals[0]];
  if (isPair) return [1, vals[0]===vals[1]?vals[0]:vals[2], vals[0]];
  return [0, vals[0]];
}

function compareHands(p, d) {
  const ps = handScore(p), ds = handScore(d);
  if (ps[0] !== ds[0]) return ps[0] > ds[0] ? "player" : "dealer";
  for (let i = 1; i < ps.length; i++) {
    if ((ps[i]||0) !== (ds[i]||0)) return (ps[i]||0) > (ds[i]||0) ? "player" : "dealer";
  }
  return "tie";
}

const HAND_NAMES = ["High Card","Pair","Flush","Sequence","Straight Flush","Trio"];

function Card({ c }) {
  const red = RED.includes(c.s);
  return (
    <div style={{
      width: 52, height: 72, borderRadius: 7, background: "#fff",
      border: "1px solid #ddd", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 2,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)", flexShrink: 0,
    }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: red ? "#e74c3c" : "#0b0f1a", lineHeight: 1 }}>{c.r}</span>
      <span style={{ fontSize: 18, color: red ? "#e74c3c" : "#0b0f1a", lineHeight: 1 }}>{c.s}</span>
    </div>
  );
}

function CardBack() {
  return (
    <div style={{
      width: 52, height: 72, borderRadius: 7, flexShrink: 0,
      background: "linear-gradient(135deg,#1a1060,#3a2090)",
      border: "2px solid #5a40b0", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}>🂠</div>
  );
}

const STAKES = [50, 100, 200, 500, 1000];

export default function TeenPattiGame({ setPage }) {
  const [bal, setBal] = useState(0);
  const [stake, setStake] = useState(100);
  const [phase, setPhase] = useState("bet"); // bet | result
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [reveal, setReveal] = useState(false);

  useEffect(() => { fetchBalance().then(setBal); }, []);

  const deal = async () => {
    if (stake > bal) return setMsg("Insufficient balance!");
    setLoading(true); setMsg(""); setReveal(false);
    const deck = newDeck();
    const [p,,, d] = [...deal3(deck), deck];
    const [pHand, dHand] = [p, d];
    setPlayerCards(pHand); setDealerCards(dHand);

    const winner = compareHands(pHand, dHand);
    const won = winner === "player";
    const isTie = winner === "tie";
    const winAmount = isTie ? stake : won ? stake * 2 : 0;

    const res = await settleGame("teenPatti", stake, won || isTie, winAmount);
    if (res.success) {
      setBal(res.balance);
      setResult({ won, isTie, winner, winAmount, profit: res.profit, pName: HAND_NAMES[handScore(pHand)[0]], dName: HAND_NAMES[handScore(dHand)[0]] });
      setTimeout(() => setReveal(true), 600);
      setMsg(isTie ? "🤝 Tie! Stake returned" : won ? `🎉 You Win! +₹${winAmount - stake}` : `💸 Dealer wins. -₹${stake}`);
    } else { setMsg("❌ " + (res.error || "Error")); }
    setPhase("result"); setLoading(false);
  };

  const reset = () => { setPhase("bet"); setPlayerCards([]); setDealerCards([]); setResult(null); setMsg(""); setReveal(false); };

  return (
    <div style={{ background: "#0d5a1a", minHeight: "100%", margin: -20, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setPage("games")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← Back</button>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#F2B824" }}>♣ Teen Patti</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#F2B824", background: "rgba(0,0,0,0.3)", padding: "6px 16px", borderRadius: 20 }}>🪙 {bal.toLocaleString()}</div>
      </div>

      {/* Table */}
      <div style={{ background: "#0a4a15", border: "3px solid #1a7a25", borderRadius: 16, padding: 24, maxWidth: 600, margin: "0 auto" }}>
        {/* Dealer */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#a8f0b0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Dealer {result && <span style={{ color: "#fff", fontWeight: 800 }}>— {result.dName}</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {phase === "bet" ? [0,1,2].map(i => <CardBack key={i} />) :
             reveal ? dealerCards.map((c,i) => <Card key={i} c={c} />) :
             [0,1,2].map(i => <CardBack key={i} />)}
          </div>
        </div>

        {/* Result banner */}
        {msg && (
          <div style={{
            textAlign: "center", padding: "12px 20px", borderRadius: 10, marginBottom: 16,
            background: result?.isTie ? "rgba(242,184,36,0.2)" : result?.won ? "rgba(46,204,113,0.2)" : "rgba(231,76,60,0.2)",
            border: `1px solid ${result?.isTie ? "#F2B824" : result?.won ? "#2ecc71" : "#e74c3c"}`,
            fontSize: 16, fontWeight: 800, color: result?.isTie ? "#F2B824" : result?.won ? "#2ecc71" : "#e74c3c",
          }}>
            {msg}
          </div>
        )}

        {/* Player */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#a8f0b0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Your Hand {result && <span style={{ color: "#fff", fontWeight: 800 }}>— {result.pName}</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {phase === "bet" ? [0,1,2].map(i => <CardBack key={i} />) :
             playerCards.map((c,i) => <Card key={i} c={c} />)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: 600, margin: "20px auto" }}>
        {/* Stake buttons */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#a8b4cc", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Select Stake</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STAKES.map(s => (
              <button key={s} onClick={() => { if (phase==="bet") setStake(s); }}
                style={{ padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                  background: stake===s ? "#F2B824" : "rgba(255,255,255,0.1)", color: stake===s ? "#0b0f1a" : "#f0f4ff" }}>
                ₹{s}
              </button>
            ))}
          </div>
        </div>

        {phase === "bet" ? (
          <button onClick={deal} disabled={loading}
            style={{ width: "100%", padding: "14px", background: "#F2B824", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", color: "#0b0f1a", fontFamily: "inherit" }}>
            {loading ? "Dealing..." : `Deal — Stake ₹${stake}`}
          </button>
        ) : (
          <button onClick={reset}
            style={{ width: "100%", padding: "14px", background: "#2ecc71", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#0b0f1a", fontFamily: "inherit" }}>
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
