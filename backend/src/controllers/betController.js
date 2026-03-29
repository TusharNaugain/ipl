const Bet = require("../models/Bet");
const Match = require("../models/Match");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

/**
 * POST /api/bets
 * Place a sports bet (BACK or LAY).
 * Deducts stake from user wallet immediately.
 * On settlement, credits winnings via settleBets().
 */
exports.placeBet = (io) => async (req, res) => {
  try {
    const {
      matchId,
      selection,    // "team1" | "team2" | "draw"
      betType = "BACK", // "BACK" | "LAY"
      stake,
    } = req.body;

    // ── Validation ─────────────────────────────────────────────────────────
    if (!matchId || !selection || !stake) {
      return res.status(400).json({ error: "matchId, selection, and stake are required" });
    }
    if (!["team1","team2","draw"].includes(selection)) {
      return res.status(400).json({ error: "selection must be team1, team2, or draw" });
    }
    const stakeAmt = Math.floor(Number(stake));
    if (isNaN(stakeAmt) || stakeAmt < 10) {
      return res.status(400).json({ error: "Minimum stake is 10 coins" });
    }

    // ── Fetch Match ─────────────────────────────────────────────────────────
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.status === "COMPLETED" || match.status === "CANCELLED") {
      return res.status(400).json({ error: "Betting is closed for this match" });
    }
    if (match.status === "SUSPENDED") {
      return res.status(400).json({ error: "Betting suspended temporarily — please try again shortly" });
    }

    // ── Get odds from match ─────────────────────────────────────────────────
    const oddsData = match.odds[selection];
    const odds = betType === "BACK" ? oddsData.back : oddsData.lay;
    const payout = Math.floor(stakeAmt * odds);
    const profit = payout - stakeAmt;

    // ── User wallet deduction ───────────────────────────────────────────────
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.coins < stakeAmt) {
      return res.status(400).json({ error: `Insufficient balance. You have ${user.coins} coins, need ${stakeAmt}` });
    }

    user.coins -= stakeAmt;
    await user.save();

    // ── Record transaction ──────────────────────────────────────────────────
    await Transaction.create({
      userId: user._id,
      type: "BET_PLACED",
      amount: stakeAmt,
      description: `Bet: ${betType} ${String(odds)}x on ${match.team1} vs ${match.team2} — ${selection}`,
      balanceAfter: user.coins,
    });

    // ── Increment match volume ──────────────────────────────────────────────
    match.odds[selection].volume = (match.odds[selection].volume || 0) + stakeAmt;
    match.totalMatched = (match.totalMatched || 0) + stakeAmt;
    await match.save();

    // ── Create Bet document ─────────────────────────────────────────────────
    const bet = await Bet.create({
      userId: user._id,
      matchId: match._id,
      selection,
      betType,
      odds,
      stake: stakeAmt,
      payout,
      profit,
      matchSnapshot: {
        team1: match.team1,
        team2: match.team2,
        competition: match.competition,
        sport: match.sport,
        scheduledAt: match.scheduledAt,
      },
    });

    // ── WebSocket broadcasts ────────────────────────────────────────────────
    io.emit("wallet:update",  { userId: user._id.toString(), coins: user.coins });
    io.emit("bet:new",         bet);
    io.to(`match:${match._id}`).emit("match:volume", {
      matchId: match._id,
      totalMatched: match.totalMatched,
    });

    return res.status(201).json({
      bet,
      wallet: { coins: user.coins },
      message: `Bet placed! Potential win: ${payout} coins`,
    });
  } catch (err) {
    console.error("PlaceBet error:", err);
    return res.status(500).json({ error: "Failed to place bet" });
  }
};

/**
 * GET /api/bets
 * Returns all bets placed by the authenticated user (sorted newest first).
 */
exports.getBets = async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(bets);
  } catch (err) {
    console.error("GetBets error:", err);
    return res.status(500).json({ error: "Failed to fetch bets" });
  }
};

/**
 * GET /api/bets/match/:matchId
 * Returns bets for a specific match by the authenticated user.
 */
exports.getBetsByMatch = async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user.id, matchId: req.params.matchId })
      .sort({ createdAt: -1 });
    return res.json(bets);
  } catch (err) {
    console.error("GetBetsByMatch error:", err);
    return res.status(500).json({ error: "Failed to fetch bets" });
  }
};

/**
 * GET /api/bets/stats
 * Returns betting statistics for the authenticated user.
 */
exports.getBetStats = async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user.id });
    const total  = bets.length;
    const won    = bets.filter(b => b.status === "WON").length;
    const lost   = bets.filter(b => b.status === "LOST").length;
    const pending= bets.filter(b => b.status === "PENDING").length;
    const totalStaked   = bets.reduce((s, b) => s + b.stake, 0);
    const totalReturned = bets.filter(b => b.status === "WON").reduce((s, b) => s + b.settledAmount, 0);
    const netPnl = totalReturned - totalStaked;

    return res.json({ total, won, lost, pending, totalStaked, totalReturned, netPnl, winRate: total ? ((won/total)*100).toFixed(1) : "0.0" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
};
