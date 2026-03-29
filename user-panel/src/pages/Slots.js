// ── Slots — Parimatch style ───────────────────────────────────────────────────
import { useState } from "react";

const CATS = ["All", "New", "Hot", "Megaways", "Hold & Win", "777", "Fruits", "Egyptian"];

const SLOT_GAMES = [
  { label:"3 Super Hot Chillies",  icon:"🔥", bg:"#c0392b", cat:"Hot"      },
  { label:"Buffalo King Megaways", icon:"🦬", bg:"#8e44ad", cat:"Megaways" },
  { label:"Coin Strike 2: H&W",    icon:"🪙", bg:"#2980b9", cat:"Hold & Win"},
  { label:"Thunder Coins XXL",     icon:"⚡", bg:"#2471a3", cat:"Hold & Win"},
  { label:"4 Pots Riches: H&W",    icon:"🪣", bg:"#27ae60", cat:"Hold & Win"},
  { label:"Wild Hot 40",           icon:"🌶️",bg:"#e74c3c", cat:"Hot"      },
  { label:"Wild Hot 40 Free Spins",icon:"🎰", bg:"#e74c3c", cat:"Hot"      },
  { label:"Sun of Egypt 3",        icon:"☀️", bg:"#f39c12", cat:"Egyptian" },
  { label:"Only Coins Express",    icon:"🪙", bg:"#e67e22", cat:"777"      },
  { label:"777 Coins",             icon:"7️⃣",bg:"#d35400", cat:"777"      },
  { label:"Coin Strike: H&W",      icon:"🪙", bg:"#1a5276", cat:"Hold & Win"},
  { label:"CoinUP: Hot Fire",      icon:"🔥", bg:"#922b21", cat:"Hot"      },
  { label:"Coin Volcano",          icon:"🌋", bg:"#884ea0", cat:"Hold & Win"},
  { label:"Fruit Box Classic",     icon:"🍒", bg:"#c0392b", cat:"Fruits"   },
  { label:"Royal Coins 2: H&W",    icon:"👑", bg:"#9b59b6", cat:"Hold & Win"},
  { label:"Candy Palace",          icon:"🍭", bg:"#e91e8c", cat:"New"      },
  { label:"Fortune Gems 2",        icon:"💎", bg:"#16a085", cat:"New"      },
  { label:"Fortune Gems 3",        icon:"💎", bg:"#1abc9c", cat:"New"      },
  { label:"Money Coming Expanded", icon:"💸", bg:"#2ecc71", cat:"New"      },
  { label:"100 Super Hot",         icon:"🌡️",bg:"#e74c3c", cat:"Hot"      },
  { label:"Zeus vs Hades",         icon:"⚡", bg:"#2c3e50", cat:"Megaways" },
  { label:"Big Bass Amazon Xtreme",icon:"🐟", bg:"#1e8bc3", cat:"New"      },
  { label:"Gates of Olympus 1000", icon:"🏛️",bg:"#8e44ad", cat:"Megaways" },
  { label:"Sweet Bonanza",         icon:"🍬", bg:"#e91e8c", cat:"Fruits"   },
];

function SlotCard({ g, setPage }) {
  const colMap = { "#c0392b":"#e74c3c","#8e44ad":"#9b59b6","#2980b9":"#3498db","#2471a3":"#2980b9","#27ae60":"#2ecc71","#e74c3c":"#ff6b6b","#f39c12":"#f1c40f","#9b59b6":"#9b59b6","#1a5276":"#2980b9","#884ea0":"#8e44ad","#e91e8c":"#fd79a8","#16a085":"#1abc9c","#1abc9c":"#2ecc71","#2ecc71":"#27ae60","#2c3e50":"#34495e","#1e8bc3":"#2980b9","#e67e22":"#f39c12","#d35400":"#e67e22","#922b21":"#e74c3c" };
  const handleClick = () => {
    if (g.label === "3 Super Hot Chillies") {
      setPage("hotchillies");
    } else {
      localStorage.setItem("activeSlotGame", g.label);
      setPage("themedslot");  // ← themed slot with auto theme picker
    }
  };
  return (
    <div onClick={handleClick}
      style={{ cursor:"pointer", borderRadius:8, overflow:"hidden", border:"1px solid #222", transition:"transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.5)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ height:110, background:`linear-gradient(135deg,${g.bg},${colMap[g.bg]||g.bg})`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontSize:38, position:"relative", gap:4 }}>
        {g.icon}
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s", fontSize:13, fontWeight:800, color:"#e9f400", backdropFilter:"blur(0px)" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background="rgba(0,0,0,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.background="rgba(0,0,0,0)"; }}>
          ▶ PLAY
        </div>
      </div>
      <div style={{ padding:"8px 10px", background:"#1c1c1c" }}>
        <div style={{ fontSize:10, fontWeight:600, color:"#ddd", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.label}</div>
        <div style={{ fontSize:9, color:"#555", marginTop:2 }}>{g.cat}</div>
      </div>
    </div>
  );
}

export default function Slots({ setPage }) {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = SLOT_GAMES.filter(g =>
    (cat === "All" || g.cat === cat) &&
    (!search || g.label.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background:"#111111", margin:-20, padding:0, minHeight:"100%" }}>
      {/* Search + category bar */}
      <div style={{ background:"#1c1c1c", borderBottom:"1px solid #222", padding:"10px 16px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        {/* Search input */}
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#111", border:"1px solid #333", borderRadius:6, padding:"7px 12px", flex:"0 0 200px" }}>
          <span style={{ color:"#555" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search slots..."
            style={{ background:"transparent", border:"none", color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none", width:"100%" }} />
        </div>
        {/* Category tabs */}
        <div style={{ display:"flex", overflowX:"auto", gap:0 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ flexShrink:0, padding:"8px 14px", background:"transparent", border:"none", borderBottom:cat===c?"2px solid #e9f400":"2px solid transparent", color:cat===c?"#e9f400":"#888", fontWeight:cat===c?700:400, fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 16px" }}>
        {/* TOP Slots header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontSize:16, fontWeight:700, color:"#fff" }}>🎲 TOP Slots</span>
          <span style={{ fontSize:12, color:"#555" }}>{filtered.length} games</span>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px,1fr))", gap:10, marginBottom:24 }}>
          {filtered.map((g,i) => <SlotCard key={i} g={g} setPage={setPage} />)}
        </div>

        {/* Promo */}
        <div style={{ padding:"24px", borderRadius:10, background:"linear-gradient(135deg,#1a0a1a,#2a0a4a)", border:"1px solid #333", textAlign:"center" }}>
          <div style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:6 }}>SPIN INTO SPRING 🌸</div>
          <div style={{ fontSize:13, color:"#aaa", marginBottom:16 }}>Watch the reels bloom with rewards</div>
          <button onClick={() => setPage("wallet")} style={{ padding:"11px 28px", background:"#e9f400", border:"none", borderRadius:6, fontSize:14, fontWeight:800, cursor:"pointer", color:"#000", fontFamily:"inherit" }}>
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
}
