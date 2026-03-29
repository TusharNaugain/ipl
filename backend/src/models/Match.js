const mongoose = require("mongoose");

/**
 * Match — stores sports betting matches with dynamic odds.
 * Supports IPL cricket, soccer, tennis, basketball, etc.
 * Odds are stored as Back (to-win) and Lay (to-lose) for each side.
 */
const OddsSchema = new mongoose.Schema({
  back:    { type: Number, default: 1.90 }, // Blue odds box — price to back (bet FOR)
  lay:     { type: Number, default: 2.00 }, // Pink odds box — price to lay (bet AGAINST)
  volume:  { type: Number, default: 0    }, // Total matched amount (₹)
}, { _id: false });

const MatchSchema = new mongoose.Schema({
  // Basic info
  sport:       { type: String, enum: ["cricket","soccer","tennis","basketball","hockey","horse_racing","boxing","other"], default: "cricket" },
  competition: { type: String, default: "IPL T20" },
  team1:       { type: String, required: true },
  team2:       { type: String, required: true },
  venue:       { type: String, default: "" },

  // Timing
  scheduledAt: { type: Date, default: Date.now },

  // Status
  status: {
    type: String,
    enum: ["UPCOMING", "LIVE", "COMPLETED", "CANCELLED", "SUSPENDED"],
    default: "UPCOMING",
  },

  // Winner (team1 / team2 / draw / null)
  winner: { type: String, default: null },

  // Live score (cricket: "142/3 (18.4 Ov)", soccer: "2-1 (67′)")
  score: { type: String, default: "" },

  // Back/Lay ODDS for TEAM1, TEAM2, and DRAW
  odds: {
    team1: { type: OddsSchema, default: () => ({ back: 1.90, lay: 2.00, volume: 0 }) },
    team2: { type: OddsSchema, default: () => ({ back: 1.90, lay: 2.00, volume: 0 }) },
    draw:  { type: OddsSchema, default: () => ({ back: 3.40, lay: 3.60, volume: 0 }) },
  },

  // ── FANCY MARKETS ─────────────────────────────────────────────────────────────
  // YES/NO session/player/over bets (e.g. "6 over run RCB", "1st wicket fall")
  fancyMarkets: [{
    title:      { type: String, required: true },   // e.g. "6 OVER RUN RCB"
    yesRate:    { type: Number, default: 10 },       // YES payout rate (e.g. 10 means 10 per 100 bet)
    noRate:     { type: Number, default: 10 },       // NO payout rate
    yesValue:   { type: Number, default: 0 },        // YES run-value reference (e.g. 44)
    noValue:    { type: Number, default: 0 },        // NO run-value reference (e.g. 45)
    minBet:     { type: Number, default: 100 },
    maxBet:     { type: Number, default: 50000 },
    suspended:  { type: Boolean, default: false },
    result:     { type: String, enum: ["PENDING","YES","NO"], default: "PENDING" },
  }],

  // External API match ID (from cricket-api-free-data or similar)
  externalId: { type: String, default: null },

  // Total coins matched on this event
  totalMatched: { type: Number, default: 0 },

  // Source — manual | rapidapi
  source: { type: String, enum: ["manual","rapidapi","static"], default: "manual" },

}, { timestamps: true });

module.exports = mongoose.model("Match", MatchSchema);
