const mongoose = require("mongoose");

/**
 * Bet — stores a placed sports bet (Back or Lay on a match outcome).
 * betType: "BACK" = betting FOR a team to win
 *          "LAY"  = betting AGAINST a team (takes the lay odds position)
 * selection: "team1" | "team2" | "draw"
 * Settled automatically when admin calls PATCH /api/matches/:id/settle
 */
const BetSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  matchId:   { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },

  // What the user is betting on (match bets: team1/team2/draw; fancy bets: YES/NO)
  selection: { type: String, enum: ["team1","team2","draw","YES","NO"], required: true },
  betType:   { type: String, enum: ["BACK","LAY","FANCY"], default: "BACK" },

  // ── Fancy Market fields (optional — only set for fancy bets) ─────────────────
  fancyMarketId:    { type: mongoose.Schema.Types.ObjectId, default: null },
  fancyMarketTitle: { type: String, default: null },  // e.g. "6 OVER RUN RCB"
  fancySelection:   { type: String, enum: ["YES","NO",null], default: null },

  // Odds at time of bet (locked in — won't change after placement)
  odds:      { type: Number, required: true, min: 1 },

  // Stake = coins deducted at bet time
  stake:     { type: Number, required: true, min: 1 },

  // Potential payout (stake × odds, rounded down)
  payout:    { type: Number, required: true },

  // Profit if wins (payout - stake)
  profit:    { type: Number, required: true },

  // Status lifecycle
  status: {
    type: String,
    enum: ["PENDING", "WON", "LOST", "VOID", "CANCELLED"],
    default: "PENDING",
  },

  // Coins returned to user on settlement (stake × odds on WIN; 0 on LOST)
  settledAmount: { type: Number, default: 0 },

  // Convenience snapshot of match info at time of bet
  matchSnapshot: {
    team1: String,
    team2: String,
    competition: String,
    sport: String,
    scheduledAt: Date,
  },

}, { timestamps: true });

// Virtual for display
BetSchema.virtual("selectionLabel").get(function () {
  const snap = this.matchSnapshot || {};
  if (this.selection === "team1") return snap.team1 || "Team 1";
  if (this.selection === "team2") return snap.team2 || "Team 2";
  return "Draw";
});

module.exports = mongoose.model("Bet", BetSchema);
