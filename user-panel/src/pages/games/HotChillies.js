import { useState, useRef, useEffect, useCallback } from "react";

// ── 3 Super Hot Chillies — Themed Slot Machine ────────────────────────────────

// ── Web Audio Engine ──────────────────────────────────────────────────────────
let _actx;
function ac() {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
  return _actx;
}
function tone(freq, type, dur, vol = 0.3, delay = 0) {
  const ctx = ac(), osc = ctx.createOscillator(), g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type = type; osc.frequency.value = freq;
  const t = ctx.currentTime + delay;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t); osc.stop(t + dur + 0.01);
}
function noise(vol = 0.2) {
  const ctx = ac(), buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * vol;
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buf; g.gain.value = 1;
  src.connect(g); g.connect(ctx.destination); src.start();
}
const SFX = {
  tick:    () => noise(0.12),
  stop:    (i) => { tone(140 + i*30, "square", 0.1, 0.3); tone(200 + i*30, "sine", 0.08, 0.15, 0.05); },
  click:   () => tone(900, "square", 0.03, 0.1),
  win1:    () => { [440,550,660,880].forEach((f,i) => tone(f,"sine",0.2,0.35,i*0.09)); },
  win2:    () => { [440,550,660,880,1100].forEach((f,i) => { tone(f,"sine",0.25,0.4,i*0.08); tone(f*1.5,"triangle",0.12,0.2,i*0.08+0.04); }); },
  jackpot: () => {
    [523,659,784,1047,784,1047,1319,1047,784,1047,1319,1568].forEach((f,i) => {
      tone(f,"sine",0.18,0.45,i*0.07);
      tone(f*0.5,"triangle",0.1,0.2,i*0.07+0.03);
    });
  },
};

// ── Symbols ───────────────────────────────────────────────────────────────────
const SYMS = [
  { id:"cherry", label:"🍒", name:"Cherry",   pay3:4,  pay2:1,  grad:["#ff1744","#b71c1c"], glow:"#ff1744" },
  { id:"lemon",  label:"🍋", name:"Lemon",    pay3:6,  pay2:2,  grad:["#ffea00","#f57f17"], glow:"#ffea00" },
  { id:"orange", label:"🍊", name:"Orange",   pay3:8,  pay2:2,  grad:["#ff6d00","#e65100"], glow:"#ff6d00" },
  { id:"grape",  label:"🍇", name:"Grape",    pay3:10, pay2:3,  grad:["#aa00ff","#6200ea"], glow:"#aa00ff" },
  { id:"bar",    label:"BAR",name:"Bar",      pay3:15, pay2:0,  grad:["#37474f","#263238"], glow:"#90a4ae" },
  { id:"bell",   label:"🔔", name:"Bell",     pay3:20, pay2:5,  grad:["#ff6f00","#e65100"], glow:"#ffca28" },
  { id:"chilli", label:"🌶️", name:"Chilli",  pay3:50, pay2:10, grad:["#dd2c00","#bf360c"], glow:"#ff3d00" },
  { id:"fire7",  label:"7",  name:"Fire 7",  pay3:200,pay2:0,  grad:["#ff1744","#d50000"], glow:"#ff6d00" },
];

const WEIGHTS = [22, 18, 16, 12, 12, 10, 7, 3];
function rSym() {
  let r = Math.random() * WEIGHTS.reduce((a,b)=>a+b,0);
  for (let i = 0; i < WEIGHTS.length; i++) { r -= WEIGHTS[i]; if (r <= 0) return SYMS[i]; }
  return SYMS[0];
}
function mkStrip(final, n=28) {
  const s = []; for (let i=0;i<n-1;i++) s.push(rSym()); s.push(final); return s;
}

function getCoins() { return JSON.parse(localStorage.getItem("user")||"{}").coins||0; }
function addCoins(d) {
  const u = JSON.parse(localStorage.getItem("user")||"{}");
  u.coins = Math.max(0, (u.coins||0)+d);
  localStorage.setItem("user", JSON.stringify(u));
  return u.coins;
}

const BETS = [10, 25, 50, 100, 500];
const SH = 100; // symbol height px

// ── Symbol Tile ───────────────────────────────────────────────────────────────
function Tile({ sym, dim, lit }) {
  const isText = sym.id === "bar" || sym.id === "fire7";
  return (
    <div style={{
      height: SH, display:"flex", alignItems:"center", justifyContent:"center",
      filter: dim ? "brightness(0.22) saturate(0.2)" : "none",
      transition: "filter 0.2s",
    }}>
      <div style={{
        width: 78, height: 78, borderRadius: 16,
        background: `linear-gradient(145deg, ${sym.grad[0]}, ${sym.grad[1]})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow: lit
          ? `0 0 0 3px #fff, 0 0 24px ${sym.glow}, 0 0 48px ${sym.glow}88, inset 0 1px 0 rgba(255,255,255,0.25)`
          : `0 4px 16px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15)`,
        border: `1px solid ${sym.grad[0]}88`,
        transition:"box-shadow 0.25s",
        position:"relative", overflow:"hidden",
      }}>
        {/* Shine overlay */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"45%", background:"linear-gradient(180deg,rgba(255,255,255,0.18),transparent)", borderRadius:"16px 16px 0 0", pointerEvents:"none" }} />
        {isText ? (
          <span style={{
            fontSize: sym.id==="fire7" ? 38 : 22,
            fontWeight: 900, color:"#fff", fontFamily:"Georgia,serif",
            fontStyle: sym.id==="fire7" ? "italic" : "normal",
            textShadow:`0 2px 8px rgba(0,0,0,0.8), 0 0 20px ${sym.glow}`,
            letterSpacing: sym.id==="bar"?2:-1,
          }}>{sym.label}</span>
        ) : (
          <span style={{ fontSize:40, filter:`drop-shadow(0 2px 6px rgba(0,0,0,0.6)) drop-shadow(0 0 10px ${sym.glow}44)` }}>
            {sym.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Reel ──────────────────────────────────────────────────────────────────────
function Reel({ strip, spinning, delay, onStop, lit }) {
  const [idx, setIdx] = useState(strip.length - 3);
  const [running, setRunning] = useState(false);
  const tickRef = useRef();

  useEffect(() => {
    if (!spinning) return;
    setRunning(true);
    let i = 0;
    tickRef.current = setInterval(() => {
      try { SFX.tick(); } catch(e){}
      setIdx(p => (p + 1) % strip.length);
      i++;
    }, 75);
    setTimeout(() => {
      clearInterval(tickRef.current);
      setIdx(strip.length - 3);
      setRunning(false);
      try { SFX.stop(delay/350); } catch(e){}
      onStop();
    }, 900 + delay);
    return () => clearInterval(tickRef.current);
  }, [spinning]);

  const visible = [0,1,2].map(i => strip[(idx + i) % strip.length]);

  return (
    <div style={{
      flex:1, height: SH*3, overflow:"hidden", borderRadius:14,
      background:"linear-gradient(180deg,#0a0000,#050000)",
      border:"2px solid #2a0000",
      boxShadow:"inset 0 6px 28px rgba(0,0,0,0.95)",
      position:"relative",
    }}>
      {/* Top/bottom fade */}
      <div style={{ position:"absolute",top:0,left:0,right:0,height:44,background:"linear-gradient(180deg,rgba(0,0,0,0.85),transparent)",zIndex:3,pointerEvents:"none" }} />
      <div style={{ position:"absolute",bottom:0,left:0,right:0,height:44,background:"linear-gradient(0deg,rgba(0,0,0,0.85),transparent)",zIndex:3,pointerEvents:"none" }} />
      <div style={{ display:"flex", flexDirection:"column" }}>
        {visible.map((s, i) => (
          <Tile key={i} sym={s} dim={i!==1} lit={!running && i===1 && lit} />
        ))}
      </div>
    </div>
  );
}

// ── Flame Particle ────────────────────────────────────────────────────────────
function Flames() {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
      {Array.from({length:18}).map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          left:`${(i/18)*100 + (Math.random()*4-2)}%`,
          bottom:-20, fontSize:`${16+Math.random()*16}px`,
          animation:`flameRise ${1.8+Math.random()*1.4}s ${Math.random()*2}s ease-in infinite`,
          opacity:0.7,
        }}>
          {["🔥","🔥","🌶️","🔥","🔥","✨"][i%6]}
        </div>
      ))}
    </div>
  );
}

// ── Coin Rain ─────────────────────────────────────────────────────────────────
function CoinRain({ active, amount }) {
  if (!active) return null;
  return (
    <>
      {Array.from({length: amount > 1000 ? 30 : amount > 200 ? 20 : 10}).map((_,i) => (
        <div key={i} style={{
          position:"fixed", top:-30, left:`${Math.random()*100}vw`,
          zIndex:9999, pointerEvents:"none",
          fontSize:`${18+Math.random()*14}px`,
          animation:`coinDrop ${0.9+Math.random()*0.8}s ${Math.random()*1.2}s linear forwards`,
        }}>
          {["🪙","💰","🔥"][i%3]}
        </div>
      ))}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HotChillies({ setPage }) {
  const [balance, setBalance]   = useState(getCoins);
  const [bet, setBet]           = useState(25);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels]       = useState(() => [
    { strip: [SYMS[0],SYMS[2],SYMS[4],SYMS[1],SYMS[3]] },
    { strip: [SYMS[1],SYMS[3],SYMS[5],SYMS[2],SYMS[6]] },
    { strip: [SYMS[2],SYMS[4],SYMS[6],SYMS[3],SYMS[7]] },
  ]);
  const [result, setResult]     = useState(null);
  const [winRow, setWinRow]     = useState(false);
  const [coinRain, setCoinRain] = useState(false);
  const [history, setHistory]   = useState([]);
  const stopped = useRef(0);
  const finals  = useRef([]);

  const onStop = useCallback(() => {
    stopped.current++;
    if (stopped.current < 3) return;

    const [a,b,c] = finals.current;
    let win = 0, desc = "", lvl = 0;

    if (a.id===b.id && b.id===c.id) {
      win = bet * a.pay3; desc = `3× ${a.name}! ×${a.pay3}`; lvl = a.id==="fire7"?3:a.id==="chilli"?2:1;
    } else if (a.id===b.id && a.pay2>0) {
      win = Math.floor(bet * a.pay2); desc = `2× ${a.name}! ×${a.pay2}`; lvl = 1;
    } else if (b.id===c.id && b.pay2>0) {
      win = Math.floor(bet * b.pay2); desc = `2× ${b.name}! ×${b.pay2}`; lvl = 1;
    }

    if (win > 0) {
      const nb = addCoins(win);
      setBalance(nb);
      setWinRow(true);
      setCoinRain(true);
      setTimeout(()=>{ setWinRow(false); setCoinRain(false); }, 2500);
      try { lvl>=3?SFX.jackpot():lvl===2?SFX.win2():SFX.win1(); } catch(e){}
      setHistory(h=>[{desc,amount:win},...h.slice(0,9)]);
    } else {
      setHistory(h=>[{desc:"No win",amount:-bet},...h.slice(0,9)]);
    }
    setResult({ win: win>0, amount: win, desc: win>0?desc:"🌶️ So close! Try again!" });
    setSpinning(false);
  }, [bet]);

  const spin = () => {
    if (spinning) return;
    const bal = getCoins();
    if (bal < bet) { setResult({ win:false, amount:0, desc:"Insufficient balance!" }); return; }
    try { SFX.click(); } catch(e){}
    addCoins(-bet);
    setBalance(bal - bet);
    setResult(null); setWinRow(false); setCoinRain(false);
    stopped.current = 0;

    const f = [rSym(), rSym(), rSym()];
    if (Math.random()<0.3) f[0]=f[1];  // 30% 2-match
    if (Math.random()<0.08) f[2]=f[1]; // 8% 3-match (jackpot)
    finals.current = f;
    setReels(f.map(sym=>({ strip: mkStrip(sym,30) })));
    setSpinning(true);
  };

  return (
    <div style={{
      maxWidth:580, margin:"0 auto", fontFamily:"inherit",
      background:"linear-gradient(180deg,#180000,#0d0000)", borderRadius:24,
      padding:24, border:"2px solid #3a0000",
      boxShadow:"0 0 80px rgba(220,50,0,0.35), 0 0 160px rgba(220,50,0,0.12)",
      position:"relative", overflow:"hidden",
    }}>
      <Flames />
      <CoinRain active={coinRain} amount={result?.amount||0} />

      {/* Title */}
      <div style={{ textAlign:"center", marginBottom:20, position:"relative", zIndex:1 }}>
        <button onClick={()=>setPage("slots")}
          style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.06)", border:"1px solid #3a0000", borderRadius:6, color:"#aaa", padding:"5px 11px", cursor:"pointer", fontFamily:"inherit", fontSize:12 }}>
          ‹ Back
        </button>
        <div style={{ fontSize:10, fontWeight:800, letterSpacing:4, color:"#ff3d00", textTransform:"uppercase", marginBottom:4 }}>🔥 SLOT MACHINE 🔥</div>
        <div style={{ fontSize:26, fontWeight:900, color:"#fff", textShadow:"0 0 30px #ff3d00, 0 2px 0 #000", letterSpacing:-0.5 }}>
          3 SUPER HOT CHILLIES
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:4, marginTop:4 }}>
          {["🌶️","🌶️","🌶️"].map((e,i)=>(
            <span key={i} style={{ fontSize:22, animation:`bounce 0.6s ${i*0.15}s ease-in-out infinite alternate` }}>{e}</span>
          ))}
        </div>
      </div>

      {/* Balance bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", background:"rgba(0,0,0,0.5)", borderRadius:10, border:"1px solid #2a0000", marginBottom:16, position:"relative", zIndex:1 }}>
        <span style={{ fontSize:11, color:"#ff6d00", textTransform:"uppercase", letterSpacing:1, fontWeight:700 }}>🪙 Balance</span>
        <span style={{ fontSize:22, fontWeight:900, color:"#ff3d00", fontFamily:"monospace", textShadow:"0 0 15px rgba(255,61,0,0.5)" }}>
          ₹{getCoins().toLocaleString("en-IN")}
        </span>
      </div>

      {/* Machine frame */}
      <div style={{
        background:"linear-gradient(180deg,#1a0000,#0a0000)",
        borderRadius:20, padding:"16px 16px", marginBottom:16,
        border:"3px solid #3a0000",
        boxShadow:"inset 0 0 40px rgba(0,0,0,0.9), 0 0 30px rgba(200,30,0,0.2)",
        position:"relative", zIndex:1,
      }}>
        {/* Payline glow bar */}
        <div style={{
          position:"absolute", left:12, right:12, top:"50%", transform:"translateY(-50%)",
          height: SH+8, borderRadius:14, pointerEvents:"none", zIndex:10,
          border:`2px solid ${winRow?"rgba(255,100,0,0.7)":"rgba(255,50,0,0.08)"}`,
          boxShadow: winRow?"0 0 30px rgba(255,80,0,0.4),inset 0 0 20px rgba(255,80,0,0.15)":"none",
          transition:"all 0.3s",
        }} />

        {/* Top flame strip */}
        <div style={{ textAlign:"center", fontSize:18, marginBottom:10, letterSpacing:3, animation:"flicker 1s ease-in-out infinite alternate" }}>🔥🔥🔥🔥🔥</div>

        {/* Reels */}
        <div style={{ display:"flex", gap:10 }}>
          {reels.map((r,ri)=>(
            <Reel key={`${ri}-${spinning}`} strip={r.strip} spinning={spinning}
              delay={ri*350} onStop={onStop} lit={winRow} />
          ))}
        </div>

        {/* Bottom flame strip */}
        <div style={{ textAlign:"center", fontSize:18, marginTop:10, letterSpacing:3, animation:"flicker 1s 0.5s ease-in-out infinite alternate" }}>🔥🔥🔥🔥🔥</div>
      </div>

      {/* Result */}
      {result && (
        <div style={{
          marginBottom:14, padding:"12px 16px", borderRadius:10, textAlign:"center",
          background: result.win?"rgba(255,80,0,0.12)":"rgba(0,0,0,0.3)",
          border:`1px solid ${result.win?"#ff3d00":"#300"}`,
          animation:"popIn 0.3s ease", position:"relative", zIndex:1,
        }}>
          {result.win ? (
            <>
              <div style={{ fontSize:22, fontWeight:900, color:"#ff6d00", textShadow:"0 0 20px rgba(255,100,0,0.7)" }}>
                🔥 +₹{result.amount.toLocaleString()} 🔥
              </div>
              <div style={{ fontSize:13, color:"#ff8a50", marginTop:4 }}>{result.desc}</div>
            </>
          ) : (
            <div style={{ fontSize:14, color:"#7a3a2a" }}>{result.desc}</div>
          )}
        </div>
      )}

      {/* Bet selector */}
      <div style={{ marginBottom:14, position:"relative", zIndex:1 }}>
        <div style={{ fontSize:10, color:"#7a2a00", textTransform:"uppercase", letterSpacing:1, marginBottom:8, fontWeight:700 }}>🔥 BET AMOUNT</div>
        <div style={{ display:"flex", gap:6 }}>
          {BETS.map(b=>(
            <button key={b} onClick={()=>{ if(!spinning){setBet(b);try{SFX.click();}catch(e){}} }}
              style={{ flex:1, padding:"10px 0", borderRadius:8,
                border: bet===b?"2px solid #ff3d00":"2px solid #200",
                background: bet===b?"rgba(255,61,0,0.15)":"rgba(0,0,0,0.4)",
                color: bet===b?"#ff6d00":"#5a2a20",
                fontWeight: bet===b?800:400, fontSize:12,
                cursor:"pointer", fontFamily:"inherit",
                boxShadow: bet===b?"0 0 12px rgba(255,61,0,0.3)":"none",
                transition:"all 0.15s",
              }}>
              ₹{b}
            </button>
          ))}
        </div>
      </div>

      {/* SPIN button */}
      <button onClick={spin} disabled={spinning}
        style={{
          width:"100%", padding:"20px 0", border:"none", borderRadius:14,
          background: spinning
            ? "rgba(255,255,255,0.05)"
            : "linear-gradient(135deg,#ff3d00,#dd2c00,#ff6d00,#dd2c00)",
          backgroundSize:"300% 300%",
          animation: spinning?"none":"hotShimmer 2s linear infinite, hotPulse 1.5s ease-in-out infinite",
          fontSize:22, fontWeight:900, letterSpacing:3, textTransform:"uppercase",
          color: spinning?"#3a1a10":"#fff",
          cursor: spinning?"not-allowed":"pointer", fontFamily:"inherit",
          boxShadow: spinning?"none":"0 0 40px rgba(255,61,0,0.5), 0 4px 20px rgba(0,0,0,0.6)",
          textShadow: spinning?"none":"0 2px 8px rgba(0,0,0,0.6)",
          transition:"all 0.25s", position:"relative", zIndex:1,
        }}>
        {spinning ? "⏳  SPINNING..." : "🌶️  SPIN  🌶️"}
      </button>

      {/* Paytable */}
      <div style={{ marginTop:16, background:"rgba(0,0,0,0.5)", borderRadius:16, padding:16, border:"1px solid #2a0000", position:"relative", zIndex:1 }}>
        <div style={{ fontSize:11, fontWeight:800, color:"#7a2a00", marginBottom:12, textTransform:"uppercase", letterSpacing:1 }}>💰 Paytable</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {SYMS.map((s,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(0,0,0,0.4)", borderRadius:10, padding:"8px 10px", border:"1px solid #200" }}>
              <div style={{ display:"flex", gap:3 }}>
                {[0,1,2].map(j=>(
                  <div key={j} style={{ width:22, height:22, borderRadius:5, background:`linear-gradient(135deg,${s.grad[0]},${s.grad[1]})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, boxShadow:`0 0 6px ${s.glow}44` }}>
                    {s.id==="bar"?<span style={{color:"#fff",fontWeight:900,fontSize:7,letterSpacing:0.5}}>BAR</span>
                    :s.id==="fire7"?<span style={{color:"#fff",fontWeight:900,fontSize:10,fontStyle:"italic"}}>7</span>
                    :s.label}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ color:"#ff6d00", fontWeight:800, fontSize:13 }}>×{s.pay3}</div>
                {s.pay2>0&&<div style={{ color:"#4a2010", fontSize:10 }}>2× = ×{s.pay2}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop:12, background:"rgba(0,0,0,0.4)", borderRadius:12, padding:14, border:"1px solid #200", position:"relative", zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#7a2a00", marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>📋 Recent</div>
          {history.map((h,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom: i<history.length-1?"1px solid #1a0500":"none" }}>
              <span style={{ fontSize:12, color:"#5a2a20" }}>{h.desc}</span>
              <span style={{ fontSize:12, fontWeight:700, color:h.amount>0?"#ff6d00":"#7a2a20" }}>
                {h.amount>0?`+₹${h.amount}`:`₹${h.amount}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CSS */}
      <style>{`
        @keyframes flameRise { 0%{transform:translateY(0) scale(1);opacity:0.8} 100%{transform:translateY(-120px) scale(0.3);opacity:0} }
        @keyframes flicker   { 0%{opacity:0.8;transform:scale(1)} 100%{opacity:1;transform:scale(1.05)} }
        @keyframes bounce    { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
        @keyframes popIn     { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes coinDrop  { from{transform:translateY(0) rotate(0deg);opacity:1} to{transform:translateY(105vh) rotate(720deg);opacity:0} }
        @keyframes hotShimmer{ 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes hotPulse  { 0%,100%{box-shadow:0 0 40px rgba(255,61,0,0.5),0 4px 20px rgba(0,0,0,0.6)} 50%{box-shadow:0 0 70px rgba(255,100,0,0.8),0 4px 30px rgba(0,0,0,0.7)} }
      `}</style>
    </div>
  );
}
