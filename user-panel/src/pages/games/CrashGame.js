import { useState, useRef, useEffect, useCallback } from "react";
import { playCrash } from "../../services/gameEngine";

// ── Audio ─────────────────────────────────────────────────────────────────────
let _ac, _engOsc, _engGain;
function ac(){if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();return _ac;}
function tone(f,t,d,v=.3,dl=0){try{const c=ac(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=t;o.frequency.value=f;const s=c.currentTime+dl;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v,s+.01);g.gain.exponentialRampToValueAtTime(.001,s+d);o.start(s);o.stop(s+d+.01);}catch(e){}}
function startEng(){try{const c=ac();_engGain=c.createGain();_engGain.gain.value=.045;_engGain.connect(c.destination);_engOsc=c.createOscillator();_engOsc.type="sawtooth";_engOsc.frequency.value=110;_engOsc.connect(_engGain);_engOsc.start();}catch(e){}}
function stopEng(){try{_engOsc?.stop();_engOsc=null;_engGain=null;}catch(e){}}
function revEng(m){try{if(_engOsc)_engOsc.frequency.value=90+m*18;}catch(e){}}
const SFX={
  bet:()=>{tone(700,"sine",.07,.2);tone(1050,"sine",.05,.15,.04);},
  fly:()=>{try{tone(160,"sawtooth",.3,.2);tone(320,"sine",.15,.1,.1);}catch(e){}},
  cash:()=>{[523,659,784,1047,1319].forEach((f,i)=>tone(f,"sine",.22,.4,i*.07));},
  exit:()=>{tone(880,"sine",.08,.12);},
  crash:()=>{
    try{const c=ac(),b=c.createBuffer(1,c.sampleRate*.6,c.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)*.9;
    const s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=1;s.connect(g);g.connect(c.destination);s.start();}catch(e){}
    [200,160,120,80].forEach((f,i)=>tone(f,"square",.45,.4,i*.06));
  },
};

// ── Fake players ──────────────────────────────────────────────────────────────
const NAMES = ["Rahul K","Priya S","Amit D","Neha M","Vikram R","Pooja A","Sanjay B","Divya C","Rohan P","Kavya N","Arjun V","Sneha T","Karan J","Anjali G","Dev S","Riya E","Nikhil F","Meera H","Aditya L","Simran O","Deepak Q","Swati U","Manish W","Payal X","Gaurav Y"];
const getBets = () => [50,75,100,150,200,300,500,750,1000,1500,2000];
function genPlayers(n=18){
  return Array.from({length:n},(_,i)=>({
    id: i,
    name: NAMES[i%NAMES.length],
    bet: getBets()[Math.floor(Math.random()*getBets().length)],
    cashAt: 1.1 + Math.random()*9 + (Math.random()<0.1?Math.random()*15:0),
    status:"playing", // playing | cashed | crashed
    cashedMult: null,
    profit: null,
  }));
}

// ── Canvas constants ──────────────────────────────────────────────────────────
const CW=440, CH=280;
const PAD={l:46,b:36,t:16,r:12};

// ── Draw plane ─────────────────────────────────────────────────────────────────
function drawPlane(ctx, x, y, angle, scale, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const s = scale;

  const planeColor = "#e92c3d";
  const darkRed = "#aa0011";

  // Fuselage
  ctx.beginPath();
  ctx.moveTo(-15*s, -4*s);
  ctx.quadraticCurveTo(20*s, -8*s, 35*s, 0); 
  ctx.quadraticCurveTo(20*s, 8*s, -15*s, 4*s);
  ctx.lineTo(-28*s, 0);
  ctx.closePath();
  ctx.fillStyle = planeColor;
  ctx.fill();

  // Top Fin
  ctx.beginPath();
  ctx.moveTo(-15*s, -4*s);
  ctx.lineTo(-24*s, -16*s);
  ctx.lineTo(-26*s, -16*s);
  ctx.lineTo(-28*s, -2*s);
  ctx.closePath();
  ctx.fillStyle = planeColor;
  ctx.fill();

  // Cockpit
  ctx.beginPath();
  ctx.moveTo(10*s, -4*s);
  ctx.quadraticCurveTo(20*s, -6*s, 25*s, -2*s);
  ctx.lineTo(10*s, -1*s);
  ctx.closePath();
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();

  // Bottom gears
  ctx.beginPath(); ctx.arc(-10*s, 5*s, 3*s, 0, Math.PI*2); ctx.fillStyle = darkRed; ctx.fill();
  ctx.beginPath(); ctx.arc(15*s, 5*s, 3*s, 0, Math.PI*2); ctx.fill();

  // Wings
  ctx.beginPath();
  ctx.moveTo(-5*s, 1*s);
  ctx.lineTo(-12*s, 14*s);
  ctx.lineTo(5*s, 14*s);
  ctx.lineTo(12*s, 1*s);
  ctx.closePath();
  ctx.fillStyle = planeColor;
  ctx.fill();

  // White X
  ctx.beginPath();
  ctx.moveTo(0, -2*s); ctx.lineTo(4*s, 2*s);
  ctx.moveTo(4*s, -2*s); ctx.lineTo(0, 2*s);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();

  // Propeller
  const propAngle = (time || 0) * 0.4;
  ctx.beginPath();
  ctx.moveTo(35*s, 0);
  ctx.lineTo(35*s + Math.cos(propAngle)*4*s, Math.sin(propAngle)*12*s);
  ctx.lineTo(35*s - Math.cos(propAngle)*4*s, -Math.sin(propAngle)*12*s);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 2 * s;
  ctx.stroke();

  ctx.restore();
}

// ── Main component ─────────────────────────────────────────────────────────────
function getC(){return JSON.parse(localStorage.getItem("user")||"{}").coins||0;}
function addC(d){const u=JSON.parse(localStorage.getItem("user")||"{}");u.coins=Math.max(0,(u.coins||0)+d);localStorage.setItem("user",JSON.stringify(u));return u.coins;}

const BETS=[50,100,500,1000];
const PRESETS=[1.5,2,3,5,10,20];

export default function CrashGame({setPage}){
  const cRef=useRef(null);
  const S=useRef({phase:"idle",mult:1,cp:2,parts:[],trail:[],t:0,px:80,py:CH*.65,pa:0,ps:0.85,pb:0,players:[],notifications:[]});
  const raf=useRef();
  const tick=useRef();
  const mRef=useRef(1);

  const[phase,setPhase]=useState("idle");
  const[mult,setMult]=useState(1);
  const[crashed,setCrashed]=useState(null);
  const[cashed,setCashed]=useState(null);
  const[bal,setBal]=useState(getC());
  const[amount,setAmount]=useState(100);
  const[cashAt,setCashAt]=useState(2);
  const[auto,setAuto]=useState(true);
  const[history,setHistory]=useState([]);
  const[players,setPlayers]=useState([]);
  const[notifications,setNotifs]=useState([]);

  // Notification helper
  const addNotif=(msg)=>{
    const id=Date.now()+Math.random();
    setNotifs(n=>[{id,msg},...n.slice(0,4)]);
    setTimeout(()=>setNotifs(n=>n.filter(x=>x.id!==id)),2800);
  };

  // ── Draw loop ──────────────────────────────────────────────────────────────
  const draw=useCallback(()=>{
    const cv=cRef.current; if(!cv)return;
    const ctx=cv.getContext("2d");
    const s=S.current;
    s.t++;
    const isCrash=s.phase==="crashed";

    // Background Radial Sunburst
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CW, CH);
    
    // Rotating radial rays
    ctx.save();
    ctx.translate(0, CH);
    ctx.rotate((s.t || 0) * 0.002);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    const numRays = 30;
    for (let i = 0; i < numRays; i++) {
        const a = (i / numRays) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a - 0.05) * 800, Math.sin(a - 0.05) * 800);
        ctx.lineTo(Math.cos(a + 0.05) * 800, Math.sin(a + 0.05) * 800);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Axes
    ctx.strokeStyle="rgba(255,255,255,0.1)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(PAD.l,PAD.t); ctx.lineTo(PAD.l,CH-PAD.b); ctx.lineTo(CW-PAD.r,CH-PAD.b); ctx.stroke();

    // Y labels
    ctx.fillStyle="rgba(255,255,255,.25)"; ctx.font="10px monospace"; ctx.textAlign="right";
    [1,2,3,5,10,15].forEach(v=>{
      const ry=CH-PAD.b-((v-1)/14)*(CH-PAD.t-PAD.b);
      if(ry>PAD.t+5) ctx.fillText(`${v}x`,PAD.l-4,ry+3);
    });

    // Curve
    const dm=Math.max(1.01,s.mult);
    const cColor = "#e92c3d";
    const pts=[];
    for(let i=0;i<=70;i++){
      const t=i/70, m=1+(dm-1)*Math.pow(t,.68);
      pts.push({
        x:PAD.l+t*(CW-PAD.l-PAD.r),
        y:CH-PAD.b-((m-1)/Math.max(dm-1,.01))*(CH-PAD.t-PAD.b)*.9,
      });
    }

    if(pts.length>1){
      const grd=ctx.createLinearGradient(0,PAD.t,0,CH-PAD.b);
      grd.addColorStop(0,"rgba(233,44,61,0.5)");
      grd.addColorStop(1,"rgba(233,44,61,0.0)");
      ctx.beginPath(); ctx.moveTo(pts[0].x,CH-PAD.b);
      pts.forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.lineTo(pts.at(-1).x,CH-PAD.b); ctx.closePath();
      ctx.fillStyle=grd; ctx.fill();

      ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle=cColor; ctx.lineWidth=4;
      ctx.stroke();
    }

    // Plane
    const tip=pts.at(-1)||{x:80,y:CH*.65};
    const prev=pts.at(-5)||pts[0]||{x:60,y:CH*.65};
    const ang=Math.atan2(tip.y-prev.y,tip.x-prev.x);

    if(s.phase==="flying"){
      s.px+=(tip.x-s.px)*.2; s.py+=(tip.y-s.py)*.2;
      s.pa=ang+Math.sin(s.t*.06)*.05;
      s.ps=0.9;
      drawPlane(ctx,s.px,s.py,s.pa,s.ps,s.t);
    } else if(s.phase==="crashed"){
      s.px+=6; s.py-=4; s.pa=Math.min(s.pa+.05, .8);
      if(s.px<CW+100) drawPlane(ctx,s.px,s.py,s.pa,s.ps,s.t);
    } else {
      s.px=90+Math.sin(s.t*.018)*12; s.py=CH*.42+Math.sin(s.t*.025)*10;
      s.pa=-0.06+Math.sin(s.t*.022)*.04;
      drawPlane(ctx,s.px,s.py,s.pa,.88,s.t);
    }

    // Big multiplier
    if(s.phase==="flying"||s.phase==="crashed"){
      ctx.font=`bold 64px sans-serif`;
      ctx.textAlign="center"; 
      ctx.fillStyle=isCrash ? "#e92c3d" : "#ffffff";
      ctx.fillText(`${s.mult.toFixed(2)}x`, CW*.5, CH*.48);
      if(isCrash){
        ctx.font="bold 24px sans-serif";
        ctx.fillStyle="#e92c3d";
        ctx.fillText("FLEW AWAY!", CW*.5, CH*.48+36);
      }
    }

    raf.current=requestAnimationFrame(draw);
  },[]);

  useEffect(()=>{
    raf.current=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf.current);stopEng();};
  },[draw]);

  // ── Simulate other players cashing out ────────────────────────────────────
  const updatePlayers=(curMult,cp)=>{
    setPlayers(prev=>{
      const updated=prev.map(p=>{
        if(p.status!=="playing") return p;
        if(curMult>=cp) return{...p,status:"crashed"};
        if(curMult>=p.cashAt){
          const profit=Math.floor(p.bet*p.cashAt);
          setTimeout(()=>{addNotif(`${p.name} cashed out @ ${p.cashAt.toFixed(2)}x  +₹${profit}`);SFX.exit();},0);
          return{...p,status:"cashed",cashedMult:p.cashAt,profit};
        }
        return p;
      });
      return updated;
    });
  };

  // ── Game logic ─────────────────────────────────────────────────────────────
  const startFlight=()=>{
    const b=getC(); if(b<amount) return;
    addC(-amount); setBal(b-amount);
    const result=playCrash(cashAt,amount);
    const cp=result.crashPoint;
    mRef.current=1;
    const newPlayers=genPlayers(18);
    setPlayers(newPlayers);
    Object.assign(S.current,{phase:"flying",mult:1,cp,parts:[],trail:[],px:80,py:CH*.65,ps:.85,});
    setCrashed(null);setCashed(null);setMult(1);setPhase("flying");
    SFX.fly(); startEng();

    tick.current=setInterval(()=>{
      const cur=mRef.current;
      const nm=parseFloat((cur<3?cur+.032:cur<10?cur+.065:cur+.13).toFixed(2));
      mRef.current=nm; S.current.mult=nm; revEng(nm);
      setMult(nm);
      updatePlayers(nm,cp);

      if(auto&&nm>=cashAt&&S.current.phase==="flying"){doExit(nm,cp);return;}
      if(nm>=cp) doCrash(cp);
    },80);
  };

  const doExit=(m,cp)=>{
    clearInterval(tick.current); stopEng();
    const won=m<cp;
    const pay=won?Math.floor(amount*m):0;
    if(won)addC(pay);
    S.current.phase=won?"won":"crashed";
    S.current.mult=won?m:cp;
    setCashed(m); setCrashed(cp);
    setPhase(won?"won":"crashed");
    setBal(getC());
    if(won){SFX.cash();addNotif(`You cashed out @ ${m.toFixed(2)}x  +₹${pay}`);}
    else{SFX.crash();}
    setHistory(h=>[{mult:won?m:cp,won,amount:won?pay:-amount},...h.slice(0,9)]);
  };

  const manualCash=()=>{
    if(S.current.phase!=="flying")return;
    const m=mRef.current; doExit(m,m+1);
  };

  const doCrash=(cp)=>{
    clearInterval(tick.current); stopEng();
    S.current.phase="crashed"; S.current.mult=cp;
    setCrashed(cp); setMult(cp); setPhase("crashed");
    SFX.crash();
    setPlayers(p=>p.map(pl=>pl.status==="playing"?{...pl,status:"crashed"}:pl));
    setHistory(h=>[{mult:cp,won:false,amount:-amount},...h.slice(0,9)]);
  };

  const reset=()=>{
    S.current.phase="idle"; S.current.mult=1; S.current.parts=[];
    setPhase("idle"); setMult(1); setCrashed(null); setCashed(null); setPlayers([]);
  };

  const isFlying=phase==="flying";
  const isDone=["crashed","won"].includes(phase);
  const didWin=phase==="won";
  const didCrash=phase==="crashed";
  const multCol=didCrash?"#ff4444":didWin?"#e9f400":"#00e676";

  const sortedPlayers=[...players].sort((a,b)=>{
    if(a.status==="cashed"&&b.status!=="cashed") return -1;
    if(b.status==="cashed"&&a.status!=="cashed") return 1;
    return 0;
  });

  return(
    <div style={{maxWidth:760,margin:"0 auto",fontFamily:"inherit"}}>
      <div style={{position:"fixed",top:80,right:24,zIndex:9999,display:"flex",flexDirection:"column",gap:6,pointerEvents:"none"}}>
        {notifications.map(n=>(
          <div key={n.id} style={{padding:"8px 14px",background:"rgba(0,230,118,0.12)",border:"1px solid rgba(0,230,118,0.3)",borderRadius:8,color:"#00e676",fontSize:12,fontWeight:700,animation:"notifSlide .35s ease",backdropFilter:"blur(8px)",whiteSpace:"nowrap"}}>
            {n.msg}
          </div>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button onClick={()=>{clearInterval(tick.current);stopEng();cancelAnimationFrame(raf.current);setPage("instant");}}
          style={{background:"#1c1c1c",border:"1px solid #333",borderRadius:6,color:"#aaa",padding:"6px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>
          ‹ Back
        </button>
        <div>
          <span style={{fontSize:18,fontWeight:900,color:"#e9f400"}}>✈️ Spribe Aviator Game</span>
          <span style={{fontSize:11,color:"#555",marginLeft:8}}>Cash out before it crashes!</span>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div style={{fontSize:10,color:"#555"}}>Balance</div>
          <div style={{fontSize:17,fontWeight:800,color:"#e9f400",fontFamily:"monospace"}}>₹{bal.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{width:190,background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:14,overflow:"hidden",flexShrink:0}}>
          <div style={{padding:"8px 12px",borderBottom:"1px solid #1a1a1a",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1}}>Players</span>
            <span style={{fontSize:11,color:"#333"}}>{players.filter(p=>p.status==="cashed").length}/{players.length}</span>
          </div>
          <div style={{height:280,overflowY:"auto",scrollbarWidth:"thin"}}>
            {sortedPlayers.length===0?(
              <div style={{padding:16,textAlign:"center",color:"#333",fontSize:12}}>Start a round to see live players</div>
            ):sortedPlayers.map(p=>(
              <div key={p.id} style={{padding:"6px 10px",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",alignItems:"center",background:p.status==="cashed"?"rgba(0,230,118,0.04)":p.status==="crashed"?"rgba(255,50,0,0.03)":"transparent",transition:"background .3s"}}>
                <div>
                  <div style={{fontSize:11,color:p.status==="cashed"?"#00e676":p.status==="crashed"?"#555":"#aaa",fontWeight:p.status==="cashed"?700:400}}>{p.name}</div>
                  <div style={{fontSize:10,color:"#444"}}>₹{p.bet}</div>
                </div>
                <div style={{textAlign:"right",fontSize:11}}>
                  {p.status==="cashed"&&<span style={{color:"#00e676",fontWeight:800,fontFamily:"monospace"}}>{p.cashedMult.toFixed(2)}x</span>}
                  {p.status==="playing"&&<span style={{color:"#333"}}>🎮</span>}
                  {p.status==="crashed"&&<span style={{color:"#ff4444",fontSize:13}}>💥</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{flex:1,minWidth:0}}>
          <div style={{borderRadius:14,overflow:"hidden",border:"2px solid #1a1a1a",marginBottom:12,position:"relative",boxShadow:`0 0 60px ${isFlying?"rgba(0,200,100,0.12)":didCrash?"rgba(255,50,0,0.12)":"rgba(0,80,200,0.08)"}`}}>
            <canvas ref={cRef} width={CW} height={CH} style={{width:"100%",display:"block"}}/>

            {phase==="idle"&&(
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                <div style={{textAlign:"center",padding:"14px 24px",background:"rgba(0,0,0,.55)",borderRadius:12,border:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontSize:22,fontWeight:900,color:"#e9f400"}}>PLACE YOUR BET</div>
                  <div style={{fontSize:11,color:"#666",marginTop:4}}>18 players waiting...</div>
                </div>
              </div>
            )}

            {didWin&&(
              <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",textAlign:"center",padding:"8px 20px",background:"rgba(0,0,0,.65)",borderRadius:10,border:"1px solid rgba(233,244,0,.3)",whiteSpace:"nowrap",animation:"popIn .3s ease"}}>
                <span style={{fontSize:20,fontWeight:900,color:"#e9f400"}}>🎉 +₹{Math.floor(amount*(cashed||1)).toLocaleString()}</span>
                <span style={{fontSize:12,color:"#aaa",marginLeft:8}}>@ {cashed?.toFixed(2)}x</span>
              </div>
            )}
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${multCol},${multCol}88)`,opacity:isFlying?.8:0,transition:"opacity .3s"}}/>
          </div>

          <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:14,padding:14,display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Bet</div>
                <div style={{display:"flex",gap:4}}>
                  {BETS.map(b=>(
                    <button key={b} onClick={()=>!isFlying&&setAmount(b)}
                      style={{flex:1,padding:"8px 0",borderRadius:6,border:amount===b?"2px solid #e9f400":"2px solid #222",background:amount===b?"rgba(233,244,0,.07)":"#0a0a0a",color:amount===b?"#e9f400":"#555",fontSize:11,fontWeight:amount===b?800:400,cursor:"pointer",fontFamily:"inherit"}}>
                      ₹{b}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{flex:1,minWidth:200}}>
                <div style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>
                  Auto Cash Out
                  <label style={{marginLeft:8,fontSize:10,cursor:"pointer",color:auto?"#00e676":"#444"}}>
                    <input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)} style={{marginRight:3}}/>
                    {auto?"ON":"OFF"}
                  </label>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {PRESETS.map(v=>(
                    <button key={v} onClick={()=>!isFlying&&setCashAt(v)}
                      style={{padding:"7px 9px",borderRadius:6,border:cashAt===v?"2px solid #00e676":"2px solid #222",background:cashAt===v?"rgba(0,230,118,.07)":"#0a0a0a",color:cashAt===v?"#00e676":"#555",fontSize:11,fontWeight:cashAt===v?800:400,cursor:"pointer",fontFamily:"inherit"}}>
                      {v}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!isFlying&&!isDone&&(
              <button onClick={startFlight}
                style={{width:"100%",padding:"17px 0",background:"linear-gradient(135deg,#003366,#001a40,#004d1a)",border:"none",borderRadius:12,fontSize:17,fontWeight:900,cursor:"pointer",color:"#fff",fontFamily:"inherit",letterSpacing:2,boxShadow:"0 0 30px rgba(0,180,80,.2)",animation:"flyPulse 2s ease-in-out infinite"}}>
                ✈️  BET ₹{amount} &amp; FLY
              </button>
            )}
            {isFlying&&(
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1,padding:"13px 0",background:"#050f05",border:"1px solid #0d3a0d",borderRadius:12,textAlign:"center",fontSize:12,color:"#2ecc71"}}>
                  ✈️ <span style={{fontFamily:"monospace",fontWeight:900,fontSize:17,color:multCol}}>{mult.toFixed(2)}x</span>
                </div>
                <button onClick={manualCash}
                  style={{flex:1,padding:"10px 0",background:"linear-gradient(135deg,#e9f400,#c8d000)",border:"none",borderRadius:12,fontSize:15,fontWeight:900,cursor:"pointer",color:"#000",fontFamily:"inherit",animation:"cashPulse .5s ease-in-out infinite alternate",boxShadow:"0 0 30px rgba(233,244,0,.4)"}}>
                  💰 CASH OUT<br/><span style={{fontSize:11}}>+₹{Math.floor(amount*mult).toLocaleString()}</span>
                </button>
              </div>
            )}
            {isDone&&(
              <button onClick={reset}
                style={{width:"100%",padding:"15px 0",background:"#1a1a1a",border:"2px solid #2a2a2a",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",color:"#777",fontFamily:"inherit"}}>
                🔄 Play Again
              </button>
            )}
          </div>

          {history.length>0&&(
            <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
              {history.map((h,i)=>(
                <div key={i} style={{padding:"4px 10px",borderRadius:20,background:h.won?"rgba(233,244,0,.07)":"rgba(255,68,68,.07)",border:`1px solid ${h.won?"#e9f400":"#ff4444"}33`,fontSize:11,color:h.won?"#e9f400":"#ff4444",fontWeight:700,fontFamily:"monospace"}}>
                  {h.mult.toFixed(2)}x {h.won?`+₹${h.amount}`:"💥"}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes flyPulse{0%,100%{box-shadow:0 0 30px rgba(0,180,80,.2)}50%{box-shadow:0 0 55px rgba(0,180,80,.5)}}
        @keyframes cashPulse{from{transform:scale(1)}to{transform:scale(1.04)}}
        @keyframes popIn{from{opacity:0;transform:translateX(-50%) scale(.9)}to{opacity:1;transform:translateX(-50%) scale(1)}}
        @keyframes notifSlide{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
      `}</style>
    </div>
  );
}
