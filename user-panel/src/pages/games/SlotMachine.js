import { useState, useRef, useEffect, useCallback } from "react";

// ── Slot Machine — Premium Casino Style + Sounds ─────────────────────────────

// ── Web Audio Sound Engine ────────────────────────────────────────────────────
function createAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const playTone = (freq, type, duration, vol = 0.3, delay = 0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  };

  return {
    spinTick: () => {
      // Short noise tick for reel spinning
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buf; gain.gain.value = 0.3;
      src.connect(gain); gain.connect(ctx.destination);
      src.start();
    },
    reelStop: (reelIdx) => {
      playTone(180 + reelIdx * 40, "square", 0.12, 0.25);
      playTone(220 + reelIdx * 40, "sine", 0.1, 0.15, 0.05);
    },
    winSmall: () => {
      [523, 659, 784, 1047].forEach((f, i) => playTone(f, "sine", 0.2, 0.3, i * 0.1));
    },
    winBig: () => {
      [523, 659, 784, 880, 1047, 1319].forEach((f, i) => {
        playTone(f, "sine", 0.25, 0.35, i * 0.08);
        playTone(f * 1.5, "triangle", 0.15, 0.2, i * 0.08 + 0.04);
      });
    },
    jackpot: () => {
      const notes = [523,659,784,1047,784,659,523,784,1047,1319,1047,784,1047,1319,1568];
      notes.forEach((f, i) => playTone(f, "sine", 0.18, 0.4, i * 0.07));
      notes.forEach((f, i) => playTone(f * 0.5, "triangle", 0.12, 0.25, i * 0.07 + 0.03));
    },
    click: () => playTone(800, "square", 0.04, 0.1),
  };
}

let audio;
function getAudio() {
  if (!audio) audio = createAudio();
  return audio;
}

// ── Symbol Definitions ────────────────────────────────────────────────────────
const SYMBOLS = [
  { id: "cherry",  name: "Cherry",   pay3: 5,   pay2: 1.5, color: "#e74c3c", bg: "#ff6b6b", label: "🍒", shadow: "#c0392b" },
  { id: "lemon",   name: "Lemon",    pay3: 8,   pay2: 2,   color: "#f1c40f", bg: "#f9d71c", label: "🍋", shadow: "#d4ac0d" },
  { id: "orange",  name: "Orange",   pay3: 10,  pay2: 2.5, color: "#e67e22", bg: "#f39c12", label: "🍊", shadow: "#ca6f1e" },
  { id: "grape",   name: "Grape",    pay3: 12,  pay2: 3,   color: "#9b59b6", bg: "#8e44ad", label: "🍇", shadow: "#76448a" },
  { id: "bell",    name: "Bell",     pay3: 20,  pay2: 5,   color: "#f39c12", bg: "#f5b041", label: "🔔", shadow: "#d68910" },
  { id: "star",    name: "Star",     pay3: 30,  pay2: 7,   color: "#3498db", bg: "#5dade2", label: "⭐", shadow: "#2471a3" },
  { id: "seven",   name: "Lucky 7",  pay3: 75,  pay2: 15,  color: "#e74c3c", bg: "#e91e63", label: "7",  shadow: "#880e4f" },
  { id: "diamond", name: "Diamond",  pay3: 150, pay2: 25,  color: "#00bcd4", bg: "#26c6da", label: "◆",  shadow: "#00838f" },
];

// Weighted picks — 7 and diamond are rare
const WEIGHTS = [22, 20, 18, 16, 14, 10, 5, 3];

function randomSym() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEIGHTS.length; i++) { r -= WEIGHTS[i]; if (r <= 0) return SYMBOLS[i]; }
  return SYMBOLS[0];
}

function generateStrip(finalSym, len = 28) {
  const strip = [];
  for (let i = 0; i < len - 1; i++) strip.push(randomSym());
  strip.push(finalSym);
  return strip;
}

function getBalance() { return JSON.parse(localStorage.getItem("user") || "{}").coins || 0; }
function updateBalance(delta) {
  const u = JSON.parse(localStorage.getItem("user") || "{}");
  u.coins = Math.max(0, (u.coins || 0) + delta);
  localStorage.setItem("user", JSON.stringify(u));
  return u.coins;
}

const BETS = [10, 25, 50, 100, 500];
const SYM_H = 96;
const VISIBLE = 3;

// ── Symbol Card ───────────────────────────────────────────────────────────────
function SymCard({ sym, dim = false, highlight = false }) {
  const isText = sym.id === "seven" || sym.id === "diamond";
  return (
    <div style={{
      height: SYM_H, display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", transition: "all 0.15s",
      filter: dim ? "brightness(0.3) saturate(0.3)" : "none",
    }}>
      {/* Symbol card with gradient */}
      <div style={{
        width: 72, height: 72, borderRadius: 14,
        background: `linear-gradient(145deg, ${sym.bg}, ${sym.color})`,
        boxShadow: highlight
          ? `0 0 0 3px #e9f400, 0 0 20px rgba(233,244,0,0.5), 0 4px 12px ${sym.shadow}88`
          : `0 4px 12px ${sym.shadow}66, inset 0 1px 0 rgba(255,255,255,0.3)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${sym.bg}88`,
        transition: "box-shadow 0.2s",
      }}>
        {isText ? (
          <span style={{
            fontSize: sym.id === "seven" ? 38 : 30, fontWeight: 900,
            color: "#fff", textShadow: `0 2px 8px ${sym.shadow}`,
            fontFamily: "Georgia, serif", fontStyle: sym.id === "seven" ? "italic" : "normal",
            letterSpacing: -1,
          }}>{sym.label}</span>
        ) : (
          <span style={{ fontSize: 38, lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>
            {sym.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Reel ─────────────────────────────────────────────────────────────────────
function Reel({ spinning, strip, delay, onStop, winRow }) {
  const [posIdx, setPosIdx] = useState(strip.length - VISIBLE);
  const [isSpinning, setIsSpinning] = useState(false);
  const rafRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!spinning) return;
    setIsSpinning(true);
    let speed = 3; // symbols per 100ms
    let current = 0;

    // Play tick sounds during spin
    tickRef.current = setInterval(() => {
      try { getAudio().spinTick(); } catch(e) {}
      current = (current + 1) % strip.length;
      setPosIdx(p => (p + 1) % strip.length);
    }, 80);

    // Stop after delay
    setTimeout(() => {
      clearInterval(tickRef.current);
      // Snap to final position
      setPosIdx(strip.length - VISIBLE);
      setIsSpinning(false);
      try { getAudio().reelStop(delay / 350); } catch(e) {}
      onStop && onStop();
    }, 900 + delay);

    return () => clearInterval(tickRef.current);
  }, [spinning]);

  // Get 3 visible symbols
  const visible = [];
  for (let i = 0; i < VISIBLE; i++) {
    visible.push(strip[(posIdx + i) % strip.length]);
  }

  return (
    <div style={{
      flex: 1, height: SYM_H * VISIBLE, overflow: "hidden", borderRadius: 12,
      background: "linear-gradient(180deg, #0a0a0a, #050505)",
      border: "2px solid #1a1a1a",
      boxShadow: "inset 0 4px 24px rgba(0,0,0,0.9)",
      position: "relative",
    }}>
      {/* Top/bottom fade masks */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 40, background: "linear-gradient(180deg, rgba(0,0,0,0.8), transparent)", zIndex: 3, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(0deg, rgba(0,0,0,0.8), transparent)", zIndex: 3, pointerEvents: "none" }} />

      <div style={{
        display: "flex", flexDirection: "column",
        animation: isSpinning ? "reelSpin 0.08s steps(1) infinite" : "none",
      }}>
        {visible.map((s, i) => (
          <SymCard key={i} sym={s} dim={i !== 1} highlight={!isSpinning && i === 1 && winRow} />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SlotMachine({ setPage, gameName = "Slot Machine" }) {
  const [balance, setBalance] = useState(getBalance);
  const [bet, setBet] = useState(25);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [winRow, setWinRow] = useState(false);
  const [reels, setReels] = useState([
    { strip: [SYMBOLS[0], SYMBOLS[2], SYMBOLS[4], SYMBOLS[1], SYMBOLS[3]] },
    { strip: [SYMBOLS[1], SYMBOLS[3], SYMBOLS[5], SYMBOLS[2], SYMBOLS[4]] },
    { strip: [SYMBOLS[2], SYMBOLS[4], SYMBOLS[6], SYMBOLS[3], SYMBOLS[5]] },
  ]);
  const [coinRain, setCoinRain] = useState([]);
  const stoppedCount = useRef(0);
  const finalSyms = useRef([]);

  const handleReelStop = useCallback(() => {
    stoppedCount.current += 1;
    if (stoppedCount.current < 3) return;

    const c = finalSyms.current;
    let winAmt = 0, desc = "", level = 0;

    if (c[0].id === c[1].id && c[1].id === c[2].id) {
      winAmt = bet * c[0].pay3; desc = `3× ${c[0].name}! ×${c[0].pay3}`; level = c[0].id === "diamond" || c[0].id === "seven" ? 3 : 2;
    } else if (c[0].id === c[1].id) {
      winAmt = Math.floor(bet * c[0].pay2); desc = `2× ${c[0].name}! ×${c[0].pay2}`; level = 1;
    } else if (c[1].id === c[2].id) {
      winAmt = Math.floor(bet * c[1].pay2); desc = `2× ${c[1].name}! ×${c[1].pay2}`; level = 1;
    }

    if (winAmt > 0) {
      const newBal = updateBalance(winAmt);
      setBalance(newBal);
      setWinRow(true);
      // Rain coins
      setCoinRain(Array.from({ length: level === 3 ? 30 : level === 2 ? 20 : 10 }, (_, i) => ({
        id: i, x: Math.random() * 100, delay: Math.random() * 1000, dur: 800 + Math.random() * 600,
      })));
      setTimeout(() => { setWinRow(false); setCoinRain([]); }, 2500);
      // Sound
      try { level >= 3 ? getAudio().jackpot() : level === 2 ? getAudio().winBig() : getAudio().winSmall(); } catch(e) {}
    }

    setResult({ win: winAmt > 0, amount: winAmt, desc: winAmt > 0 ? desc : "Better luck next time!" });
    setHistory(h => [{ desc: winAmt > 0 ? desc : "No win", amount: winAmt > 0 ? winAmt : -bet }, ...h.slice(0, 9)]);
    setSpinning(false);
  }, [bet]);

  const spin = () => {
    if (spinning) return;
    const bal = getBalance();
    if (bal < bet) { setResult({ win: false, amount: 0, desc: "Insufficient balance!" }); return; }
    try { getAudio().click(); } catch(e) {}

    updateBalance(-bet);
    setBalance(bal - bet);
    setResult(null); setWinRow(false); setCoinRain([]);
    stoppedCount.current = 0;

    // Decide final symbols
    const finals = [randomSym(), randomSym(), randomSym()];
    if (Math.random() < 0.28) finals[0] = finals[1];      // 2-match chance
    if (Math.random() < 0.07) finals[2] = finals[1];      // 3-match chance (on top of 2-match)
    finalSyms.current = finals;

    setReels(finals.map(f => ({ strip: generateStrip(f, 30) })));
    setSpinning(true);
  };

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", fontFamily: "inherit", position: "relative" }}>
      {/* Coin rain */}
      {coinRain.map(c => (
        <div key={c.id} style={{
          position: "fixed", top: 0, left: `${c.x}vw`, zIndex: 9999, pointerEvents: "none",
          fontSize: 22, animation: `coinFall ${c.dur}ms ${c.delay}ms linear forwards`,
        }}>🪙</div>
      ))}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setPage("slots")}
          style={{ background: "#1c1c1c", border: "1px solid #333", borderRadius: 6, color: "#aaa", padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
          ‹ Back
        </button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#e9f400", textShadow: "0 0 20px rgba(233,244,0,0.4)" }}>🎰 {gameName}</h2>
      </div>

      {/* Machine body */}
      <div style={{
        background: "linear-gradient(180deg, #1e1e1e, #0f0f0f)",
        border: "3px solid #2a2a2a", borderRadius: 24, padding: 24,
        boxShadow: "0 30px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}>
        {/* Balance */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, padding: "12px 16px", background: "#0a0a0a", borderRadius: 10, border: "1px solid #1a1a1a" }}>
          <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Balance</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#e9f400", fontFamily: "monospace" }}>₹{getBalance().toLocaleString("en-IN")}</span>
        </div>

        {/* Reels cage */}
        <div style={{
          background: "linear-gradient(180deg,#080808,#050505)", borderRadius: 18, padding: "14px 14px",
          border: "3px solid #111", marginBottom: 18, position: "relative",
          boxShadow: "inset 0 8px 32px rgba(0,0,0,0.95)",
        }}>
          {/* Payline highlight */}
          <div style={{
            position: "absolute", left: 10, right: 10, top: "50%",
            transform: "translateY(-50%)", height: SYM_H + 4, borderRadius: 12, zIndex: 4, pointerEvents: "none",
            border: `2px solid ${winRow ? "rgba(233,244,0,0.6)" : "rgba(255,255,255,0.04)"}`,
            boxShadow: winRow ? "0 0 30px rgba(233,244,0,0.25), inset 0 0 20px rgba(233,244,0,0.1)" : "none",
            transition: "all 0.3s",
          }} />

          {/* Reel dividers */}
          <div style={{ display: "flex", gap: 10, position: "relative" }}>
            {reels.map((reel, ri) => (
              <Reel key={`${ri}-${spinning}`} spinning={spinning} strip={reel.strip}
                delay={ri * 350} onStop={handleReelStop} winRow={winRow} />
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            marginBottom: 16, padding: "12px 16px", borderRadius: 10, textAlign: "center",
            background: result.win ? "rgba(46,204,113,0.1)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${result.win ? "#2ecc71" : "#222"}`,
            animation: "fadeSlide 0.35s ease",
          }}>
            {result.win ? (
              <>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#2ecc71", textShadow: "0 0 20px rgba(46,204,113,0.5)" }}>
                  🎉 +₹{result.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>{result.desc}</div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "#666" }}>{result.desc}</div>
            )}
          </div>
        )}

        {/* Bet selector */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Bet Amount</div>
          <div style={{ display: "flex", gap: 6 }}>
            {BETS.map(b => (
              <button key={b} onClick={() => { if (!spinning) { setBet(b); try { getAudio().click(); } catch(e) {} } }}
                style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: bet === b ? "2px solid #e9f400" : "2px solid #1a1a1a", background: bet === b ? "rgba(233,244,0,0.08)" : "#0a0a0a", color: bet === b ? "#e9f400" : "#555", fontWeight: bet === b ? 800 : 400, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                ₹{b}
              </button>
            ))}
          </div>
        </div>

        {/* Spin button */}
        <button onClick={spin} disabled={spinning}
          style={{
            width: "100%", padding: "20px 0", border: "none", borderRadius: 14,
            background: spinning ? "#111" : "linear-gradient(135deg, #e9f400 0%, #c8d000 50%, #e9f400 100%)",
            backgroundSize: "200% 200%",
            animation: spinning ? "none" : "shimmer 2s infinite, pulse 2s infinite",
            fontSize: 22, fontWeight: 900, color: spinning ? "#333" : "#000",
            cursor: spinning ? "not-allowed" : "pointer", fontFamily: "inherit",
            letterSpacing: 3, textTransform: "uppercase",
            boxShadow: spinning ? "none" : "0 0 40px rgba(233,244,0,0.35), 0 4px 20px rgba(0,0,0,0.5)",
            transition: "all 0.25s",
          }}>
          {spinning ? "⏳  SPINNING..." : "🎰  SPIN"}
        </button>
      </div>

      {/* Payout table */}
      <div style={{ marginTop: 16, background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>💰 Paytable</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {SYMBOLS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#0a0a0a", borderRadius: 10, padding: "8px 12px", border: "1px solid #1a1a1a" }}>
              {/* 3 mini symbols */}
              <div style={{ display: "flex", gap: 3 }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width: 22, height: 22, borderRadius: 5, background: `linear-gradient(135deg,${s.bg},${s.color})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                    {s.id === "seven" ? <span style={{ color:"#fff",fontWeight:900,fontSize:10,fontStyle:"italic" }}>7</span>
                    : s.id === "diamond" ? <span style={{ color:"#fff",fontWeight:900,fontSize:9 }}>◆</span>
                    : s.label}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ color: "#e9f400", fontWeight: 800, fontSize: 13 }}>×{s.pay3}</div>
                <div style={{ color: "#444", fontSize: 10 }}>2× = ×{s.pay2}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: 12, background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>📋 Recent</div>
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < history.length - 1 ? "1px solid #1a1a1a" : "none" }}>
              <span style={{ fontSize: 12, color: "#666" }}>{h.desc}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: h.amount > 0 ? "#2ecc71" : "#e74c3c" }}>
                {h.amount > 0 ? `+₹${h.amount}` : `₹${h.amount}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeSlide { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes coinFall { from { transform:translateY(-20px) rotate(0deg); opacity:1; } to { transform:translateY(100vh) rotate(720deg); opacity:0; } }
        @keyframes shimmer { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 40px rgba(233,244,0,0.35),0 4px 20px rgba(0,0,0,0.5);} 50%{box-shadow:0 0 60px rgba(233,244,0,0.65),0 4px 30px rgba(0,0,0,0.6);} }
      `}</style>
    </div>
  );
}
