import { useState, useRef, useEffect, useCallback } from "react";

// ── Sound Engine ──────────────────────────────────────────────────────────────
let _ac;
function ac() { if(!_ac) _ac=new(window.AudioContext||window.webkitAudioContext)(); return _ac; }
function tone(f,t,d,v=.3,dl=0){const c=ac(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=t;o.frequency.value=f;const s=c.currentTime+dl;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v,s+.01);g.gain.exponentialRampToValueAtTime(.001,s+d);o.start(s);o.stop(s+d+.01);}
function noise(v=.15){const c=ac(),b=c.createBuffer(1,c.sampleRate*.04,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*v;const s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=1;s.connect(g);g.connect(c.destination);s.start();}
const SFX={
  tick:()=>{try{noise(.1);}catch(e){}},
  stop:(i)=>{try{tone(160+i*35,"square",.1,.3);tone(210+i*35,"sine",.08,.15,.05);}catch(e){}},
  click:()=>{try{tone(900,"square",.03,.1);}catch(e){}},
  win1:()=>{try{[440,554,660,880].forEach((f,i)=>tone(f,"sine",.2,.35,i*.09));}catch(e){}},
  win2:()=>{try{[440,554,659,880,1100].forEach((f,i)=>{tone(f,"sine",.25,.4,i*.08);tone(f*1.5,"triangle",.12,.2,i*.08+.04);});}catch(e){}},
  jackpot:()=>{try{[523,659,784,1047,784,1047,1319,1047,784,1047,1319,1568].forEach((f,i)=>{tone(f,"sine",.18,.45,i*.07);tone(f*.5,"triangle",.1,.2,i*.07+.03);});}catch(e){}},
};

// ── Theme Definitions ─────────────────────────────────────────────────────────
const THEMES = {
  hot: {
    name:"🔥 HOT FIRE",
    bg:["#180000","#0d0000"], border:"#3a0000",
    glow:"rgba(220,50,0,0.4)", paylineColor:"rgba(255,100,0,0.7)",
    accent:"#ff3d00", accentLight:"#ff6d00", btnGrad:["#ff3d00","#dd2c00","#ff6d00"],
    particles:["🔥","🌶️","✨","🔥","🔥"],
    titleColor:"#ff3d00", titleShadow:"0 0 30px #ff3d00",
    topStrip:"🔥🔥🔥🔥🔥",
    syms:[
      {id:"cherry",  emoji:"🍒", name:"Cherry",    pay3:4,  pay2:1,  g:["#ff1744","#b71c1c"], glow:"#ff1744"},
      {id:"lemon",   emoji:"🍋", name:"Lemon",     pay3:6,  pay2:2,  g:["#ffea00","#f57f17"], glow:"#ffea00"},
      {id:"orange",  emoji:"🍊", name:"Orange",    pay3:8,  pay2:2,  g:["#ff6d00","#e65100"], glow:"#ff6d00"},
      {id:"bell",    emoji:"🔔", name:"Bell",      pay3:15, pay2:4,  g:["#ff8f00","#e65100"], glow:"#ffca28"},
      {id:"star",    emoji:"⭐", name:"Star",      pay3:20, pay2:5,  g:["#f57f17","#e65100"], glow:"#ffca28"},
      {id:"chilli",  emoji:"🌶️",name:"Chilli",    pay3:40, pay2:8,  g:["#dd2c00","#bf360c"], glow:"#ff3d00"},
      {id:"fire7",   text:"7",   name:"Fire 7",   pay3:150,pay2:0,  g:["#ff1744","#d50000"], glow:"#ff6d00",italic:true},
    ],
    animClass:"hotPulse", particleBg:"rgba(0,0,0,0.5)",
  },
  egyptian: {
    name:"☀️ EGYPT",
    bg:["#1a1200","#0d0900"], border:"#4a3800",
    glow:"rgba(220,170,0,0.35)", paylineColor:"rgba(255,200,0,0.7)",
    accent:"#ffd900", accentLight:"#ffe57a", btnGrad:["#ffab00","#ff6f00","#ffd900"],
    particles:["🏺","⭐","🔆","💫","☀️"],
    titleColor:"#ffd900", titleShadow:"0 0 30px #ffd900",
    topStrip:"✨🏺✨🏺✨",
    syms:[
      {id:"scarab", emoji:"🪲", name:"Scarab",    pay3:5,  pay2:1,  g:["#1b5e20","#2e7d32"], glow:"#66bb6a"},
      {id:"ankh",   emoji:"☥",  name:"Ankh",      pay3:8,  pay2:2,  g:["#ffab00","#ff6f00"], glow:"#ffd740"},
      {id:"eye",    emoji:"👁️", name:"Eye of Ra", pay3:12, pay2:3,  g:["#b71c1c","#7f0000"], glow:"#ef5350"},
      {id:"cat",    emoji:"🐱", name:"Bastet",    pay3:15, pay2:4,  g:["#4a148c","#311b92"], glow:"#ce93d8"},
      {id:"sphinx", emoji:"🦁", name:"Sphinx",    pay3:25, pay2:6,  g:["#e65100","#bf360c"], glow:"#ff8a65"},
      {id:"pharaoh",emoji:"🧿", name:"Pharaoh",   pay3:40, pay2:8,  g:["#ff8f00","#e65100"], glow:"#ffca28"},
      {id:"pyramid",text:"RA",  name:"Eye of Ra", pay3:150,pay2:0,  g:["#ffd900","#ff8f00"], glow:"#ffd900"},
    ],
    animClass:"egyptPulse", particleBg:"rgba(0,0,0,0.5)",
  },
  buffalo: {
    name:"🦬 BUFFALO KING",
    bg:["#0f0a00","#1a0f00"], border:"#3d2800",
    glow:"rgba(160,100,0,0.35)", paylineColor:"rgba(200,140,0,0.7)",
    accent:"#c67c00", accentLight:"#e6a800", btnGrad:["#8d5524","#5d3a1a","#c67c00"],
    particles:["🦬","🌵","⭐","🌾","🦅"],
    titleColor:"#c67c00", titleShadow:"0 0 30px #c67c00",
    topStrip:"🌵🦬🌾🦬🌵",
    syms:[
      {id:"coin",   emoji:"🪙", name:"Coin",      pay3:4,  pay2:1,  g:["#8d5524","#5d3a1a"], glow:"#c67c00"},
      {id:"cactus", emoji:"🌵", name:"Cactus",    pay3:6,  pay2:2,  g:["#2e7d32","#1b5e20"], glow:"#66bb6a"},
      {id:"eagle",  emoji:"🦅", name:"Eagle",     pay3:10, pay2:3,  g:["#1565c0","#0d47a1"], glow:"#64b5f6"},
      {id:"horse",  emoji:"🐎", name:"Horse",     pay3:15, pay2:4,  g:["#6d4c41","#4e342e"], glow:"#a1887f"},
      {id:"skull",  emoji:"💀", name:"Skull",     pay3:25, pay2:6,  g:["#37474f","#263238"], glow:"#90a4ae"},
      {id:"wolf",   emoji:"🐺", name:"Wolf",      pay3:40, pay2:8,  g:["#4a148c","#311b92"], glow:"#b39ddb"},
      {id:"buffalo",emoji:"🦬", name:"Buffalo",   pay3:150,pay2:0,  g:["#c67c00","#8d5524"], glow:"#e6a800"},
    ],
    animClass:"buffaloPulse", particleBg:"rgba(0,0,0,0.55)",
  },
  thunder: {
    name:"⚡ THUNDER COINS",
    bg:["#000510","#000a1a"], border:"#001a40",
    glow:"rgba(0,150,255,0.35)", paylineColor:"rgba(100,200,255,0.7)",
    accent:"#00b4ff", accentLight:"#74d7ff", btnGrad:["#0046aa","#001f6b","#0092e4"],
    particles:["⚡","🌩️","💫","✨","⚡"],
    titleColor:"#00b4ff", titleShadow:"0 0 30px #00b4ff",
    topStrip:"⚡🌩️⚡🌩️⚡",
    syms:[
      {id:"coin",    emoji:"🪙", name:"Coin",      pay3:4,  pay2:1,  g:["#5c6bc0","#3949ab"], glow:"#7986cb"},
      {id:"bolt",    emoji:"⚡", name:"Lightning", pay3:8,  pay2:2,  g:["#0091ea","#01579b"], glow:"#40c4ff"},
      {id:"cloud",   emoji:"🌩️",name:"Storm",     pay3:10, pay2:3,  g:["#455a64","#263238"], glow:"#90a4ae"},
      {id:"gem",     emoji:"💎", name:"Gem",       pay3:15, pay2:4,  g:["#00b4ff","#0046aa"], glow:"#74d7ff"},
      {id:"thunder", emoji:"🔵", name:"Orb",       pay3:25, pay2:6,  g:["#1a237e","#0d47a1"], glow:"#5c6bc0"},
      {id:"shield",  emoji:"🛡️",name:"Shield",    pay3:40, pay2:8,  g:["#00695c","#004d40"], glow:"#4db6ac"},
      {id:"volt",    text:"⚡7", name:"Thunder 7", pay3:200,pay2:0,  g:["#00b4ff","#0046aa"], glow:"#00b4ff"},
    ],
    animClass:"thunderPulse", particleBg:"rgba(0,0,0,0.6)",
  },
  fruits: {
    name:"🍒 FRUIT FIESTA",
    bg:["#0a1a00","#051000"], border:"#1a4000",
    glow:"rgba(0,200,60,0.35)", paylineColor:"rgba(80,255,100,0.7)",
    accent:"#00e676", accentLight:"#69f0ae", btnGrad:["#00c853","#1b5e20","#00e676"],
    particles:["🍒","🍋","🍊","🍇","🍓"],
    titleColor:"#00e676", titleShadow:"0 0 30px #00e676",
    topStrip:"🍒🍋🍊🍇🍓",
    syms:[
      {id:"cherry",  emoji:"🍒", name:"Cherry",   pay3:4,  pay2:1,  g:["#e53935","#b71c1c"], glow:"#ef5350"},
      {id:"lemon",   emoji:"🍋", name:"Lemon",    pay3:6,  pay2:2,  g:["#f9a825","#f57f17"], glow:"#ffd54f"},
      {id:"orange",  emoji:"🍊", name:"Orange",   pay3:8,  pay2:2,  g:["#f4511e","#bf360c"], glow:"#ff8a65"},
      {id:"grape",   emoji:"🍇", name:"Grape",    pay3:10, pay2:3,  g:["#8e24aa","#4a148c"], glow:"#ce93d8"},
      {id:"waterml", emoji:"🍉", name:"Watermelon",pay3:15,pay2:4,  g:["#2e7d32","#1b5e20"], glow:"#81c784"},
      {id:"strawb",  emoji:"🍓", name:"Strawberry",pay3:30,pay2:7,  g:["#c62828","#b71c1c"], glow:"#ef9a9a"},
      {id:"melon",   emoji:"🍈", name:"Melon",    pay3:100,pay2:0,  g:["#558b2f","#33691e"], glow:"#aed581"},
    ],
    animClass:"fruitPulse", particleBg:"rgba(0,0,0,0.5)",
  },
  candy: {
    name:"🍭 CANDY PALACE",
    bg:["#1a0015","#0f000d"], border:"#4a0035",
    glow:"rgba(255,0,180,0.4)", paylineColor:"rgba(255,100,220,0.75)",
    accent:"#ff4081", accentLight:"#ff80ab", btnGrad:["#e91e63","#880e4f","#ff4081"],
    particles:["🍭","🍬","🎀","💗","🍡"],
    titleColor:"#ff4081", titleShadow:"0 0 30px #ff4081",
    topStrip:"🍭🍬🎀🍬🍭",
    syms:[
      {id:"lolly",  emoji:"🍭", name:"Lollipop",  pay3:5,  pay2:1,  g:["#e91e63","#880e4f"], glow:"#f48fb1"},
      {id:"candy",  emoji:"🍬", name:"Candy",     pay3:8,  pay2:2,  g:["#9c27b0","#4a148c"], glow:"#ce93d8"},
      {id:"icecr",  emoji:"🍦", name:"Ice Cream", pay3:10, pay2:3,  g:["#e91e63","#f48fb1"], glow:"#f8bbd0"},
      {id:"cake",   emoji:"🎂", name:"Cake",      pay3:15, pay2:4,  g:["#7b1fa2","#4a148c"], glow:"#e1bee7"},
      {id:"heart",  emoji:"❤️", name:"Heart",     pay3:25, pay2:6,  g:["#c62828","#b71c1c"], glow:"#ef9a9a"},
      {id:"star",   emoji:"⭐", name:"Star",      pay3:40, pay2:8,  g:["#f9a825","#f57f17"], glow:"#fff176"},
      {id:"diamond",emoji:"💎", name:"Diamond",   pay3:150,pay2:0,  g:["#ff4081","#e91e63"], glow:"#ff80ab"},
    ],
    animClass:"candyPulse", particleBg:"rgba(0,0,0,0.5)",
  },
  gems: {
    name:"💎 FORTUNE GEMS",
    bg:["#001a10","#000d08"], border:"#004030",
    glow:"rgba(0,200,140,0.4)", paylineColor:"rgba(0,230,160,0.7)",
    accent:"#00bfa5", accentLight:"#64ffda", btnGrad:["#00897b","#004d40","#00bfa5"],
    particles:["💎","✨","💚","🌟","💠"],
    titleColor:"#00bfa5", titleShadow:"0 0 30px #00bfa5",
    topStrip:"💎✨💎✨💎",
    syms:[
      {id:"ruby",    emoji:"🔴", name:"Ruby",      pay3:5,  pay2:1,  g:["#c62828","#b71c1c"], glow:"#ef5350"},
      {id:"sapphire",emoji:"🔵", name:"Sapphire",  pay3:8,  pay2:2,  g:["#1565c0","#0d47a1"], glow:"#64b5f6"},
      {id:"emerald", emoji:"💚", name:"Emerald",   pay3:10, pay2:3,  g:["#2e7d32","#1b5e20"], glow:"#81c784"},
      {id:"topaz",   emoji:"🟡", name:"Topaz",     pay3:15, pay2:4,  g:["#f9a825","#f57f17"], glow:"#ffd54f"},
      {id:"amethyst",emoji:"💜", name:"Amethyst",  pay3:25, pay2:6,  g:["#6a1b9a","#4a148c"], glow:"#ce93d8"},
      {id:"opal",    emoji:"🌈", name:"Opal",      pay3:50, pay2:10, g:["#00897b","#004d40"], glow:"#64ffda"},
      {id:"diamond", emoji:"💎", name:"Diamond",   pay3:200,pay2:0,  g:["#00bfa5","#004d40"], glow:"#64ffda"},
    ],
    animClass:"gemPulse", particleBg:"rgba(0,0,0,0.55)",
  },
  money: {
    name:"💸 MONEY COMING",
    bg:["#001a00","#000d00"], border:"#004000",
    glow:"rgba(0,200,80,0.4)", paylineColor:"rgba(0,255,100,0.7)",
    accent:"#00c853", accentLight:"#69f0ae", btnGrad:["#1b5e20","#003300","#43a047"],
    particles:["💸","💰","🤑","💵","✨"],
    titleColor:"#00c853", titleShadow:"0 0 30px #00c853",
    topStrip:"💸💰💸💰💸",
    syms:[
      {id:"coin",   emoji:"🪙", name:"Coin",       pay3:5,  pay2:1,  g:["#8d5524","#5d3a1a"], glow:"#c67c00"},
      {id:"note",   emoji:"💵", name:"Dollar",     pay3:8,  pay2:2,  g:["#2e7d32","#1b5e20"], glow:"#81c784"},
      {id:"bag",    emoji:"💰", name:"Money Bag",  pay3:10, pay2:3,  g:["#f9a825","#f57f17"], glow:"#ffd54f"},
      {id:"card",   emoji:"💳", name:"Gold Card",  pay3:15, pay2:4,  g:["#1565c0","#0d47a1"], glow:"#64b5f6"},
      {id:"gem",    emoji:"💎", name:"Gem",        pay3:25, pay2:6,  g:["#00695c","#004d40"], glow:"#4db6ac"},
      {id:"trophy", emoji:"🏆", name:"Trophy",     pay3:50, pay2:10, g:["#ff8f00","#e65100"], glow:"#ffca28"},
      {id:"moneybag",text:"💰7",name:"Money 7",   pay3:200,pay2:0,  g:["#00c853","#1b5e20"], glow:"#69f0ae"},
    ],
    animClass:"moneyPulse", particleBg:"rgba(0,0,0,0.55)",
  },
  zeus: {
    name:"⚡ ZEUS VS HADES",
    bg:["#05001a","#0a0028"], border:"#200060",
    glow:"rgba(120,0,255,0.4)", paylineColor:"rgba(180,80,255,0.7)",
    accent:"#7c4dff", accentLight:"#b47cff", btnGrad:["#4a148c","#1a0050","#7c4dff"],
    particles:["⚡","🌩️","💫","🔱","✨"],
    titleColor:"#b47cff", titleShadow:"0 0 30px #7c4dff",
    topStrip:"🔱⚡🌩️⚡🔱",
    syms:[
      {id:"owl",    emoji:"🦉", name:"Owl",        pay3:4,  pay2:1,  g:["#37474f","#263238"], glow:"#90a4ae"},
      {id:"pegasus",emoji:"🐉", name:"Wr Dragon",  pay3:8,  pay2:2,  g:["#1565c0","#0d47a1"], glow:"#64b5f6"},
      {id:"sword",  emoji:"⚔️", name:"Sword",      pay3:10, pay2:3,  g:["#4a148c","#311b92"], glow:"#ce93d8"},
      {id:"medusa", emoji:"🐍", name:"Medusa",     pay3:15, pay2:4,  g:["#1b5e20","#003300"], glow:"#66bb6a"},
      {id:"trident",emoji:"🔱", name:"Trident",    pay3:30, pay2:7,  g:["#0046aa","#001f6b"], glow:"#74d7ff"},
      {id:"helmet", emoji:"⚡", name:"Zeus",       pay3:60, pay2:12, g:["#7c4dff","#4a148c"], glow:"#b47cff"},
      {id:"olympus",text:"XII", name:"Olympus",    pay3:200,pay2:0,  g:["#7c4dff","#311b92"], glow:"#b47cff"},
    ],
    animClass:"zeusPulse", particleBg:"rgba(0,0,0,0.6)",
  },
  fishing: {
    name:"🐟 BIG BASS AMAZON",
    bg:["#001520","#000d18"], border:"#002040",
    glow:"rgba(0,150,200,0.4)", paylineColor:"rgba(0,200,230,0.7)",
    accent:"#0097a7", accentLight:"#4dd0e1", btnGrad:["#006064","#002030","#00acc1"],
    particles:["🐟","🐠","💧","🌊","🐋"],
    titleColor:"#0097a7", titleShadow:"0 0 30px #0097a7",
    topStrip:"🐟🌊🐠🌊🐟",
    syms:[
      {id:"worm",   emoji:"🪱", name:"Worm",       pay3:4,  pay2:1,  g:["#4e342e","#3e2723"], glow:"#8d6e63"},
      {id:"hook",   emoji:"🎣", name:"Hook",       pay3:6,  pay2:2,  g:["#37474f","#263238"], glow:"#90a4ae"},
      {id:"fish1",  emoji:"🐠", name:"Tropical",  pay3:10, pay2:3,  g:["#e64a19","#bf360c"], glow:"#ff8a65"},
      {id:"fish2",  emoji:"🐟", name:"Bass",       pay3:15, pay2:4,  g:["#0277bd","#01579b"], glow:"#4fc3f7"},
      {id:"turtle", emoji:"🐢", name:"Turtle",     pay3:25, pay2:6,  g:["#2e7d32","#1b5e20"], glow:"#81c784"},
      {id:"shark",  emoji:"🦈", name:"Shark",      pay3:50, pay2:10, g:["#455a64","#263238"], glow:"#78909c"},
      {id:"whale",  emoji:"🐋", name:"Whale",      pay3:200,pay2:0,  g:["#0097a7","#006064"], glow:"#4dd0e1"},
    ],
    animClass:"fishPulse", particleBg:"rgba(0,0,0,0.55)",
  },
};

// ── Map game names to themes ──────────────────────────────────────────────────
function pickTheme(gameName) {
  const n = gameName.toLowerCase();
  if (n.includes("hot") || n.includes("chilli") || n.includes("fire") || n.includes("100 super")) return THEMES.hot;
  if (n.includes("egypt") || n.includes("sun of") || n.includes("pharaoh")) return THEMES.egyptian;
  if (n.includes("buffalo") || n.includes("western") || n.includes("king mega")) return THEMES.buffalo;
  if (n.includes("thunder") || n.includes("lightning")) return THEMES.thunder;
  if (n.includes("fruit") || n.includes("bonanza") || n.includes("sweet")) return THEMES.fruits;
  if (n.includes("candy") || n.includes("palace")) return THEMES.candy;
  if (n.includes("gem") || n.includes("fortune")) return THEMES.gems;
  if (n.includes("money") || n.includes("coin") || n.includes("pot") || n.includes("royal") || n.includes("vault") || n.includes("777")) return THEMES.money;
  if (n.includes("zeus") || n.includes("hades") || n.includes("olympus") || n.includes("gates of")) return THEMES.zeus;
  if (n.includes("bass") || n.includes("fishing") || n.includes("amazon")) return THEMES.fishing;
  return THEMES.money; // fallback
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const WEIGHTS = [22,18,16,13,11,10,10];
function rSym(syms) {
  const W = WEIGHTS.slice(0, syms.length);
  let r = Math.random() * W.reduce((a,b)=>a+b,0);
  for(let i=0;i<syms.length;i++){r-=W[i];if(r<=0)return syms[i];}
  return syms[0];
}
function mkStrip(final,syms,n=28){const s=[];for(let i=0;i<n-1;i++)s.push(rSym(syms));s.push(final);return s;}
function getCoins(){return JSON.parse(localStorage.getItem("user")||"{}").coins||0;}
function addCoins(d){const u=JSON.parse(localStorage.getItem("user")||"{}");u.coins=Math.max(0,(u.coins||0)+d);localStorage.setItem("user",JSON.stringify(u));return u.coins;}

const BETS=[10,25,50,100,500];
const SH=96;

// ── Symbol Tile ───────────────────────────────────────────────────────────────
function Tile({sym,dim,lit}){
  const isText=sym.text!=null;
  return(
    <div style={{height:SH,display:"flex",alignItems:"center",justifyContent:"center",filter:dim?"brightness(0.2) saturate(0.15)":"none",transition:"filter 0.2s"}}>
      <div style={{
        width:76,height:76,borderRadius:15,
        background:`linear-gradient(145deg,${sym.g[0]},${sym.g[1]})`,
        display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",
        boxShadow:lit?`0 0 0 3px #fff, 0 0 28px ${sym.glow}, 0 0 55px ${sym.glow}88, inset 0 1px 0 rgba(255,255,255,0.25)`:
                      `0 5px 18px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.15)`,
        border:`1px solid ${sym.g[0]}88`,transition:"box-shadow 0.25s",
      }}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"45%",background:"linear-gradient(180deg,rgba(255,255,255,0.2),transparent)",borderRadius:"15px 15px 0 0",pointerEvents:"none"}}/>
        {isText?(
          <span style={{fontSize:sym.text.length>2?18:36,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif",fontStyle:sym.italic?"italic":"normal",textShadow:`0 2px 8px rgba(0,0,0,0.9),0 0 20px ${sym.glow}`,letterSpacing:-1}}>
            {sym.text}
          </span>
        ):(
          <span style={{fontSize:40,filter:`drop-shadow(0 2px 6px rgba(0,0,0,0.7)) drop-shadow(0 0 10px ${sym.glow}55)`}}>{sym.emoji}</span>
        )}
      </div>
    </div>
  );
}

// ── Reel ──────────────────────────────────────────────────────────────────────
function Reel({strip,spinning,delay,onStop,lit,syms}){
  const[idx,setIdx]=useState(strip.length-3);
  const[running,setRunning]=useState(false);
  const tickRef=useRef();
  useEffect(()=>{
    if(!spinning)return;
    setRunning(true);
    tickRef.current=setInterval(()=>{SFX.tick();setIdx(p=>(p+1)%strip.length);},75);
    setTimeout(()=>{
      clearInterval(tickRef.current);
      setIdx(strip.length-3);
      setRunning(false);
      SFX.stop(delay/350);
      onStop();
    },900+delay);
    return()=>clearInterval(tickRef.current);
  },[spinning]);
  const visible=[0,1,2].map(i=>strip[(idx+i)%strip.length]);
  return(
    <div style={{flex:1,height:SH*3,overflow:"hidden",borderRadius:14,background:"linear-gradient(180deg,#080808,#030303)",border:"2px solid #1a1a1a",boxShadow:"inset 0 6px 28px rgba(0,0,0,0.95)",position:"relative"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:44,background:"linear-gradient(180deg,rgba(0,0,0,0.9),transparent)",zIndex:3,pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:44,background:"linear-gradient(0deg,rgba(0,0,0,0.9),transparent)",zIndex:3,pointerEvents:"none"}}/>
      <div style={{display:"flex",flexDirection:"column"}}>
        {visible.map((s,i)=><Tile key={i} sym={s} dim={i!==1} lit={!running&&i===1&&lit}/>)}
      </div>
    </div>
  );
}

// ── Floating Particles ────────────────────────────────────────────────────────
function Particles({theme}){
  return(
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      {Array.from({length:16}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",left:`${(i/16)*100+(Math.random()*5-2.5)}%`,
          bottom:-24,fontSize:`${14+Math.random()*16}px`,
          animation:`floatUp ${2+Math.random()*2}s ${Math.random()*3}s ease-in infinite`,
          opacity:0.65,
        }}>{theme.particles[i%theme.particles.length]}</div>
      ))}
    </div>
  );
}

// ── Coin Rain ─────────────────────────────────────────────────────────────────
function CoinRain({active,emoji}){
  if(!active)return null;
  return Array.from({length:25}).map((_,i)=>(
    <div key={i} style={{
      position:"fixed",top:-30,left:`${Math.random()*100}vw`,
      zIndex:9999,pointerEvents:"none",fontSize:`${18+Math.random()*14}px`,
      animation:`coinDrop ${0.8+Math.random()*1}s ${Math.random()*1.2}s linear forwards`,
    }}>{emoji}</div>
  ));
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ThemedSlotMachine({setPage,gameName="Slot Machine"}){
  const theme=pickTheme(gameName);
  const syms=theme.syms;
  const[balance,setBalance]=useState(getCoins);
  const[bet,setBet]=useState(25);
  const[spinning,setSpinning]=useState(false);
  const[reels,setReels]=useState(()=>[
    {strip:[syms[0],syms[2],syms[4],syms[1],syms[3]]},
    {strip:[syms[1],syms[3],syms[5],syms[0],syms[4]]},
    {strip:[syms[2],syms[4],syms[6]||syms[0],syms[3],syms[5]||syms[1]]},
  ]);
  const[result,setResult]=useState(null);
  const[winRow,setWinRow]=useState(false);
  const[rain,setRain]=useState(false);
  const[history,setHistory]=useState([]);
  const stopped=useRef(0);
  const finals=useRef([]);

  const onStop=useCallback(()=>{
    stopped.current++;
    if(stopped.current<3)return;
    const[a,b,c]=finals.current;
    let win=0,desc="",lvl=0;
    if(a.id===b.id&&b.id===c.id){win=bet*a.pay3;desc=`3× ${a.name}! ×${a.pay3}`;lvl=a===syms[syms.length-1]?3:2;}
    else if(a.id===b.id&&a.pay2>0){win=Math.floor(bet*a.pay2);desc=`2× ${a.name}! ×${a.pay2}`;lvl=1;}
    else if(b.id===c.id&&b.pay2>0){win=Math.floor(bet*b.pay2);desc=`2× ${b.name}! ×${b.pay2}`;lvl=1;}
    if(win>0){
      addCoins(win);setBalance(getCoins());
      setWinRow(true);setRain(true);
      setTimeout(()=>{setWinRow(false);setRain(false);},2500);
      lvl>=3?SFX.jackpot():lvl===2?SFX.win2():SFX.win1();
      setHistory(h=>[{desc,amount:win},...h.slice(0,9)]);
    }else setHistory(h=>[{desc:"No win",amount:-bet},...h.slice(0,9)]);
    setResult({win:win>0,amount:win,desc:win>0?desc:"Better luck next spin!"});
    setSpinning(false);
  },[bet,syms]);

  const spin=()=>{
    if(spinning)return;
    const bal=getCoins();
    if(bal<bet){setResult({win:false,amount:0,desc:"Insufficient balance!"});return;}
    SFX.click();addCoins(-bet);setBalance(bal-bet);
    setResult(null);setWinRow(false);setRain(false);stopped.current=0;
    const f=[rSym(syms),rSym(syms),rSym(syms)];
    if(Math.random()<.28)f[0]=f[1];
    if(Math.random()<.07)f[2]=f[1];
    finals.current=f;
    setReels(f.map(sym=>({strip:mkStrip(sym,syms,30)})));
    setSpinning(true);
  };

  return(
    <div style={{maxWidth:560,margin:"0 auto",fontFamily:"inherit",
      background:`linear-gradient(160deg,${theme.bg[0]},${theme.bg[1]})`,
      borderRadius:24,padding:24,border:`2px solid ${theme.border}`,
      boxShadow:`0 0 80px ${theme.glow},0 0 160px ${theme.glow.replace('0.4','0.1')}`,
      position:"relative",overflow:"hidden"}}>
      <Particles theme={theme}/>
      <CoinRain active={rain} emoji={theme.particles[0]}/>

      {/* Header */}
      <div style={{textAlign:"center",marginBottom:18,position:"relative",zIndex:1}}>
        <button onClick={()=>setPage("slots")} style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.06)",border:`1px solid ${theme.border}`,borderRadius:6,color:"#888",padding:"5px 11px",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>‹ Back</button>
        <div style={{fontSize:11,fontWeight:800,color:theme.accent,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>{theme.topStrip}</div>
        <div style={{fontSize:22,fontWeight:900,color:"#fff",textShadow:theme.titleShadow,letterSpacing:-0.5}}>{gameName.toUpperCase()}</div>
      </div>

      {/* Balance */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",background:"rgba(0,0,0,0.5)",borderRadius:10,border:`1px solid ${theme.border}`,marginBottom:16,position:"relative",zIndex:1}}>
        <span style={{fontSize:11,color:theme.accentLight,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>🪙 Balance</span>
        <span style={{fontSize:22,fontWeight:900,color:theme.accent,fontFamily:"monospace",textShadow:`0 0 15px ${theme.glow}`}}>₹{getCoins().toLocaleString("en-IN")}</span>
      </div>

      {/* Machine */}
      <div style={{background:"linear-gradient(180deg,#0a0a0a,#050505)",borderRadius:20,padding:"14px",marginBottom:16,border:`3px solid ${theme.border}`,boxShadow:`inset 0 0 40px rgba(0,0,0,0.95),0 0 30px ${theme.glow.replace('0.4','0.15')}`,position:"relative",zIndex:1}}>
        {/* Payline */}
        <div style={{position:"absolute",left:10,right:10,top:"50%",transform:"translateY(-50%)",height:SH+8,borderRadius:14,pointerEvents:"none",zIndex:10,border:`2px solid ${winRow?theme.paylineColor:"rgba(255,255,255,0.03)"}`,boxShadow:winRow?`0 0 30px ${theme.glow},inset 0 0 20px ${theme.glow.replace('0.4','0.12')}`:"none",transition:"all 0.3s"}}/>
        <div style={{display:"flex",gap:10}}>
          {reels.map((r,ri)=>(
            <Reel key={`${ri}-${spinning}`} strip={r.strip} spinning={spinning}
              delay={ri*350} onStop={onStop} lit={winRow} syms={syms}/>
          ))}
        </div>
      </div>

      {/* Result */}
      {result&&(
        <div style={{marginBottom:14,padding:"12px 16px",borderRadius:10,textAlign:"center",background:result.win?`${theme.glow.replace('0.4','0.12')}`:"rgba(0,0,0,0.3)",border:`1px solid ${result.win?theme.accent:theme.border}`,animation:"popIn 0.3s ease",position:"relative",zIndex:1}}>
          {result.win?(
            <><div style={{fontSize:22,fontWeight:900,color:theme.accentLight,textShadow:`0 0 20px ${theme.glow}`}}>🎉 +₹{result.amount.toLocaleString()}</div><div style={{fontSize:13,color:theme.accentLight,opacity:0.7,marginTop:4}}>{result.desc}</div></>
          ):(
            <div style={{fontSize:13,color:"#555"}}>{result.desc}</div>
          )}
        </div>
      )}

      {/* Bet */}
      <div style={{marginBottom:14,position:"relative",zIndex:1}}>
        <div style={{fontSize:10,color:theme.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontWeight:700,opacity:0.7}}>BET AMOUNT</div>
        <div style={{display:"flex",gap:6}}>
          {BETS.map(b=>(
            <button key={b} onClick={()=>{if(!spinning){setBet(b);SFX.click();}}}
              style={{flex:1,padding:"10px 0",borderRadius:8,border:bet===b?`2px solid ${theme.accent}`:`2px solid ${theme.border}`,background:bet===b?`${theme.glow.replace('0.4','0.1')}`:"rgba(0,0,0,0.4)",color:bet===b?theme.accentLight:"#444",fontWeight:bet===b?800:400,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:bet===b?`0 0 12px ${theme.glow}`:"none",transition:"all 0.15s"}}>
              ₹{b}
            </button>
          ))}
        </div>
      </div>

      {/* Spin */}
      <button onClick={spin} disabled={spinning}
        style={{width:"100%",padding:"20px 0",border:"none",borderRadius:14,
          background:spinning?"rgba(255,255,255,0.04)":`linear-gradient(135deg,${theme.btnGrad.join(",")})`,
          backgroundSize:"300% 300%",
          animation:spinning?"none":`themeShimmer 2s linear infinite, themePulse 1.5s ease-in-out infinite`,
          fontSize:22,fontWeight:900,letterSpacing:3,textTransform:"uppercase",
          color:spinning?"#333":"#fff",cursor:spinning?"not-allowed":"pointer",fontFamily:"inherit",
          boxShadow:spinning?"none":`0 0 40px ${theme.glow},0 4px 20px rgba(0,0,0,0.7)`,
          textShadow:spinning?"none":"0 2px 8px rgba(0,0,0,0.7)",transition:"all 0.25s",position:"relative",zIndex:1}}>
        {spinning?"⏳  SPINNING...":`${theme.particles[0]}  SPIN  ${theme.particles[0]}`}
      </button>

      {/* Paytable */}
      <div style={{marginTop:16,background:"rgba(0,0,0,0.5)",borderRadius:16,padding:16,border:`1px solid ${theme.border}`,position:"relative",zIndex:1}}>
        <div style={{fontSize:11,fontWeight:800,color:theme.accent,marginBottom:12,textTransform:"uppercase",letterSpacing:1,opacity:0.8}}>💰 Paytable</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {syms.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(0,0,0,0.4)",borderRadius:10,padding:"8px 10px",border:`1px solid ${theme.border}`}}>
              <div style={{display:"flex",gap:3}}>
                {[0,1,2].map(j=>(
                  <div key={j} style={{width:22,height:22,borderRadius:5,background:`linear-gradient(135deg,${s.g[0]},${s.g[1]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:s.text?8:11,color:"#fff",fontWeight:900,boxShadow:`0 0 6px ${s.glow}44`}}>
                    {s.text||s.emoji}
                  </div>
                ))}
              </div>
              <div>
                <div style={{color:theme.accentLight,fontWeight:800,fontSize:13}}>×{s.pay3}</div>
                {s.pay2>0&&<div style={{color:theme.accent,opacity:0.4,fontSize:10}}>2× = ×{s.pay2}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length>0&&(
        <div style={{marginTop:12,background:"rgba(0,0,0,0.4)",borderRadius:12,padding:14,border:`1px solid ${theme.border}`,position:"relative",zIndex:1}}>
          <div style={{fontSize:11,fontWeight:700,color:theme.accent,marginBottom:10,textTransform:"uppercase",letterSpacing:1,opacity:0.7}}>📋 Recent</div>
          {history.map((h,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<history.length-1?`1px solid ${theme.border}`:"none"}}>
              <span style={{fontSize:12,color:"#444"}}>{h.desc}</span>
              <span style={{fontSize:12,fontWeight:700,color:h.amount>0?theme.accentLight:"#5a2a20"}}>{h.amount>0?`+₹${h.amount}`:`₹${h.amount}`}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes floatUp { 0%{transform:translateY(0) scale(1);opacity:0.7} 100%{transform:translateY(-130px) scale(0.2);opacity:0} }
        @keyframes popIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes coinDrop { from{transform:translateY(0) rotate(0deg);opacity:1} to{transform:translateY(105vh) rotate(720deg);opacity:0} }
        @keyframes themeShimmer { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes themePulse { 0%,100%{box-shadow:0 0 40px ${theme.glow},0 4px 20px rgba(0,0,0,0.7)} 50%{box-shadow:0 0 70px ${theme.glow.replace('0.4','0.75')},0 4px 30px rgba(0,0,0,0.8)} }
      `}</style>
    </div>
  );
}
