import { useState } from "react";
import TopNav from "./components/TopNav";
import Sidebar from "./components/Sidebar";
import RightPanel from "./components/RightPanel";
import Login from "./pages/Login";
import Home from "./pages/Home";
import IPLLive from "./pages/IPLLive";
import SoccerLive from "./pages/SoccerLive";
import TennisLive from "./pages/TennisLive";
import BasketballLive from "./pages/BasketballLive";
import VolleyballLive from "./pages/VolleyballLive";
import HockeyLive from "./pages/HockeyLive";
import EsportsLive from "./pages/EsportsLive";
import SportLive from "./pages/SportLive";
import LiveCasino from "./pages/LiveCasino";
import Slots from "./pages/Slots";
import SlotMachine from "./pages/games/SlotMachine";
import HotChillies from "./pages/games/HotChillies";
import ThemedSlotMachine from "./pages/games/ThemedSlotMachine";
import GameHub from "./pages/GameHub";
import VIP from "./pages/VIP";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";

// Casino games
import ColorPrediction from "./pages/games/ColorPrediction";
import DiceGame from "./pages/games/DiceGame";
import SpinWheel from "./pages/games/SpinWheel";
import CrashGame from "./pages/games/CrashGame";
import MinesGame from "./pages/games/MinesGame";
import CoinFlipGame from "./pages/games/CoinFlipGame";
import HiLoGame from "./pages/games/HiLoGame";
import RouletteGame from "./pages/games/RouletteGame";
import PlinkoGame from "./pages/games/PlinkoGame";
import LimboGame from "./pages/games/LimboGame";
import NumberGame from "./pages/games/NumberGame";
import TowerGame from "./pages/games/TowerGame";
import TeenPattiGame from "./pages/games/TeenPattiGame";
import AndarBaharGame from "./pages/games/AndarBaharGame";
import DragonTigerGame from "./pages/games/DragonTigerGame";
import KenoGame from "./pages/games/KenoGame";

export default function App() {
  const [page, setPage] = useState("home");
  const [activeNav, setActiveNav] = useState("live");
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setPage("home");
  };

  if (!token) return <Login setToken={setToken} />;

  const navigate = (p) => setPage(p);

  const renderPage = () => {
    switch (page) {
      // Main sections
      case "home":        return <Home setPage={navigate} />;
      case "soccer":      return <SoccerLive setPage={navigate} />;
      case "tennis":      return <TennisLive setPage={navigate} />;
      case "basketball":  return <BasketballLive setPage={navigate} />;
      case "volleyball":  return <VolleyballLive setPage={navigate} />;
      case "icehockey":   return <HockeyLive setPage={navigate} />;
      case "esports":     return <EsportsLive setPage={navigate} />;
      
      case "horseracing": return <SportLive setPage={navigate} sportKey="horse" title="Horse Racing" icon="🏇" />;
      case "rugbyunion":  return <SportLive setPage={navigate} sportKey="rugby_union" title="Rugby Union" icon="🏉" />;
      case "boxing":      return <SportLive setPage={navigate} sportKey="boxing" title="Boxing" icon="🥊" />;
      case "baseball":    return <SportLive setPage={navigate} sportKey="baseball" title="Baseball" icon="⚾" />;
      case "greyhound":   return <SportLive setPage={navigate} sportKey="greyhound" title="Greyhounds" icon="🐕" />;
      case "snooker":     return <SportLive setPage={navigate} sportKey="snooker" title="Snooker" icon="🎱" />;
      case "golf":        return <SportLive setPage={navigate} sportKey="golf" title="Golf" icon="⛳" />;
      case "darts":       return <SportLive setPage={navigate} sportKey="darts" title="Darts" icon="🎯" />;
      case "americanfootball": return <SportLive setPage={navigate} sportKey="americanfootball" title="American Football" icon="🏈" />;
      case "rugbyleague": return <SportLive setPage={navigate} sportKey="rugby_league" title="Rugby League" icon="🏉" />;
      case "ipl":         return <IPLLive setPage={navigate} />;
      case "livecasino":  return <LiveCasino setPage={navigate} />;
      case "slots":       return <Slots setPage={navigate} />;
      case "slotmachine":  return <SlotMachine setPage={navigate} gameName={localStorage.getItem("activeSlotGame") || "Slot Machine"} />;
      case "themedslot":   return <ThemedSlotMachine setPage={navigate} gameName={localStorage.getItem("activeSlotGame") || "Slot Machine"} />;
      case "hotchillies":  return <HotChillies setPage={navigate} />;
      case "games":       return <GameHub setPage={navigate} />;
      case "vip":         return <VIP />;
      case "profile":     return <Profile />;
      case "wallet":      return <Wallet />;

      // Casino games
      case "color":       return <ColorPrediction setPage={navigate} />;
      case "dice":        return <DiceGame setPage={navigate} />;
      case "spin":        return <SpinWheel setPage={navigate} />;
      case "crash":       return <CrashGame setPage={navigate} />;
      case "mines":       return <MinesGame setPage={navigate} />;
      case "coinflip":    return <CoinFlipGame setPage={navigate} />;
      case "hilo":        return <HiLoGame setPage={navigate} />;
      case "roulette":    return <RouletteGame setPage={navigate} />;
      case "plinko":      return <PlinkoGame setPage={navigate} />;
      case "limbo":       return <LimboGame setPage={navigate} />;
      case "number":      return <NumberGame setPage={navigate} />;
      case "tower":       return <TowerGame setPage={navigate} />;
      case "teenPatti":   return <TeenPattiGame setPage={navigate} />;
      case "andarBahar":  return <AndarBaharGame setPage={navigate} />;
      case "dragonTiger": return <DragonTigerGame setPage={navigate} />;
      case "keno":        return <KenoGame setPage={navigate} />;

      default:            return <Home setPage={navigate} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#111111" }}>
      <TopNav page={page} setPage={navigate} activeNav={activeNav} setActiveNav={setActiveNav} onLogout={handleLogout} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar page={page} setPage={navigate} activeNav={activeNav} onLogout={handleLogout} />
        <div style={{ flex: 1, overflowY: "auto", background: "#111111", padding: "20px 20px" }}>
          {renderPage()}
        </div>
        <RightPanel setPage={navigate} />
      </div>
    </div>
  );
}
