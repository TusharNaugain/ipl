const Match = require("../models/Match");
const Bet   = require("../models/Bet");
const User  = require("../models/User");
const Transaction = require("../models/Transaction");

// ── GET /api/matches ──────────────────────────────────────────────────────────
// Returns all matches sorted by scheduledAt (upcoming first, then live, then completed)
exports.getMatches = async (req, res) => {
  try {
    const { sport, status, limit = 50 } = req.query;
    const filter = {};
    if (sport)  filter.sport  = sport;
    if (status) filter.status = status.toUpperCase();

    const matches = await Match.find(filter)
      .sort({ status: 1, scheduledAt: 1 })
      .limit(Number(limit));

    return res.json(matches);
  } catch (err) {
    console.error("GetMatches error:", err);
    return res.status(500).json({ error: "Failed to fetch matches" });
  }
};

// ── GET /api/matches/live ─────────────────────────────────────────────────────
exports.getLiveMatches = async (req, res) => {
  try {
    const matches = await Match.find({ status: "LIVE" }).sort({ scheduledAt: 1 });
    return res.json(matches);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch live matches" });
  }
};

// ── GET /api/matches/:id ──────────────────────────────────────────────────────
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    return res.json(match);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch match" });
  }
};

// ── POST /api/matches ─────────────────────────────────────────────────────────
// Admin: Create a new match manually
exports.createMatch = async (req, res) => {
  try {
    const {
      team1, team2, sport = "cricket", competition = "IPL T20",
      venue = "", scheduledAt,
      odds = {},
    } = req.body;

    if (!team1 || !team2) {
      return res.status(400).json({ error: "team1 and team2 are required" });
    }

    const match = await Match.create({
      team1, team2, sport, competition, venue,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      odds: {
        team1: { back: odds.team1Back || 1.90, lay: odds.team1Lay || 2.00, volume: 0 },
        team2: { back: odds.team2Back || 1.90, lay: odds.team2Lay || 2.00, volume: 0 },
        draw:  { back: odds.drawBack  || 3.40, lay: odds.drawLay  || 3.60, volume: 0 },
      },
    });

    return res.status(201).json(match);
  } catch (err) {
    console.error("CreateMatch error:", err);
    return res.status(500).json({ error: "Failed to create match" });
  }
};

// ── PATCH /api/matches/:id ────────────────────────────────────────────────────
// Admin: Update status, score, odds, or fancy markets
exports.updateMatch = (io) => async (req, res) => {
  try {
    const { status, score, odds, winner, fancyMarket } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match not found" });

    if (status) match.status = status.toUpperCase();
    if (score)  match.score  = score;
    if (winner) match.winner = winner;

    // Update specific odds fields
    if (odds) {
      if (odds.team1) Object.assign(match.odds.team1, odds.team1);
      if (odds.team2) Object.assign(match.odds.team2, odds.team2);
      if (odds.draw)  Object.assign(match.odds.draw,  odds.draw);
    }

    // ── Fancy Market management ──────────────────────────────────────────────
    // fancyMarket: { action: "add"|"update"|"suspend"|"remove", id?, data? }
    if (fancyMarket) {
      const { action, id: fmId, data } = fancyMarket;
      if (action === "add" && data) {
        match.fancyMarkets.push(data);
      } else if (action === "update" && fmId && data) {
        const fm = match.fancyMarkets.id(fmId);
        if (fm) Object.assign(fm, data);
      } else if (action === "suspend" && fmId) {
        const fm = match.fancyMarkets.id(fmId);
        if (fm) fm.suspended = true;
      } else if (action === "remove" && fmId) {
        match.fancyMarkets = match.fancyMarkets.filter(f => f._id.toString() !== fmId);
      }
    }

    await match.save();

    // Broadcast live odds update to all clients watching this match
    io.to(`match:${match._id}`).emit("match:odds_update", {
      matchId: match._id,
      odds:    match.odds,
      score:   match.score,
      status:  match.status,
      fancyMarkets: match.fancyMarkets,
    });
    io.emit("match:update", { matchId: match._id, status: match.status, score: match.score });

    return res.json(match);
  } catch (err) {
    console.error("UpdateMatch error:", err);
    return res.status(500).json({ error: "Failed to update match" });
  }
};

// ── POST /api/matches/:id/settle ─────────────────────────────────────────────
// Admin: Settle all bets for a match. Credits winners, marks losers.
exports.settleMatch = (io) => async (req, res) => {
  try {
    const { winner } = req.body; // "team1" | "team2" | "draw"
    if (!["team1","team2","draw"].includes(winner)) {
      return res.status(400).json({ error: "winner must be: team1, team2, or draw" });
    }

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.status === "COMPLETED") {
      return res.status(400).json({ error: "Match already settled" });
    }

    match.status = "COMPLETED";
    match.winner = winner;
    await match.save();

    // Fetch all pending bets for this match
    const bets = await Bet.find({ matchId: match._id, status: "PENDING", betType: { $ne: "FANCY" } });

    let settledCount = 0;
    let totalPaidOut = 0;

    for (const bet of bets) {
      const isWin = (bet.selection === winner && bet.betType === "BACK") ||
                    (bet.selection !== winner && bet.betType === "LAY");

      if (isWin) {
        bet.status = "WON";
        bet.settledAmount = bet.payout;

        // Credit user's wallet
        await User.findByIdAndUpdate(bet.userId, { $inc: { coins: bet.payout } });

        // Record credit transaction
        await Transaction.create({
          userId: bet.userId,
          type: "BET_WIN",
          amount: bet.payout,
          description: `Win: ${match.team1} vs ${match.team2} — ${bet.odds}x payout`,
          balanceAfter: 0,
        });

        totalPaidOut += bet.payout;
      } else {
        bet.status = "LOST";
        bet.settledAmount = 0;
      }

      await bet.save();
      settledCount++;

      // Emit per-user wallet update
      const user = await User.findById(bet.userId);
      if (user) {
        io.emit("wallet:update", { userId: bet.userId.toString(), coins: user.coins });
      }
    }

    // Broadcast match settled to all clients
    io.emit("match:settled", {
      matchId: match._id.toString(),
      winner,
      team1:   match.team1,
      team2:   match.team2,
      competition: match.competition,
    });

    return res.json({
      message: `Match settled. ${settledCount} bets processed. Total paid out: ${totalPaidOut} coins`,
      settledCount,
      totalPaidOut,
      match,
    });
  } catch (err) {
    console.error("SettleMatch error:", err);
    return res.status(500).json({ error: "Failed to settle match" });
  }
};

// ── POST /api/matches/:id/fancy/:fancyId/settle ───────────────────────────────
// Admin: Settle a single fancy market (YES or NO).
// Credits all FANCY bets matching the winning selection.
exports.settleFancy = (io) => async (req, res) => {
  try {
    const { id: matchId, fancyId } = req.params;
    const { result } = req.body; // "YES" | "NO"

    if (!["YES","NO"].includes(result)) {
      return res.status(400).json({ error: "result must be YES or NO" });
    }

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });

    const fm = match.fancyMarkets.id(fancyId);
    if (!fm) return res.status(404).json({ error: "Fancy market not found" });
    if (fm.result !== "PENDING") return res.status(400).json({ error: "Fancy market already settled" });

    fm.result = result;
    fm.suspended = true;
    await match.save();

    // Fetch all pending fancy bets for this specific fancy market
    const bets = await Bet.find({
      matchId: match._id,
      betType: "FANCY",
      fancyMarketId: fancyId,
      status: "PENDING"
    });

    let settledCount = 0;
    let totalPaidOut = 0;

    for (const bet of bets) {
      const isWin = bet.fancySelection === result;

      if (isWin) {
        bet.status = "WON";
        bet.settledAmount = bet.payout;

        await User.findByIdAndUpdate(bet.userId, { $inc: { coins: bet.payout } });
        await Transaction.create({
          userId: bet.userId,
          type: "BET_WIN",
          amount: bet.payout,
          description: `Fancy Win: ${fm.title} (${result}) — ${bet.stake} stake`,
          balanceAfter: 0,
        });

        totalPaidOut += bet.payout;
      } else {
        bet.status = "LOST";
        bet.settledAmount = 0;
      }

      await bet.save();
      settledCount++;

      const user = await User.findById(bet.userId);
      if (user) {
        io.emit("wallet:update", { userId: bet.userId.toString(), coins: user.coins });
      }
    }

    io.emit("fancy:settled", {
      matchId: matchId,
      fancyId: fancyId,
      title:   fm.title,
      result,
    });

    return res.json({
      message: `Fancy "${fm.title}" settled as ${result}. ${settledCount} bets processed.`,
      settledCount,
      totalPaidOut,
    });
  } catch (err) {
    console.error("SettleFancy error:", err);
    return res.status(500).json({ error: "Failed to settle fancy market" });
  }
};

// ── Odds simulation — called on a timer to simulate live odds movement ─────
// (Called from server.js every 8s for LIVE matches to make them feel real-time)
exports.simulateLiveOdds = async (io) => {
  try {
    const liveMatches = await Match.find({ status: "LIVE" });
    for (const match of liveMatches) {
      // Randomly nudge odds ±0.01–0.05 to simulate market movement
      const nudge = () => (Math.random() - 0.5) * 0.06;
      const clamp = (v, min, max) => Math.max(min, Math.min(max, parseFloat((v + nudge()).toFixed(2))));

      match.odds.team1.back = clamp(match.odds.team1.back, 1.01, 6.00);
      match.odds.team1.lay  = clamp(match.odds.team1.lay,  match.odds.team1.back + 0.02, 6.50);
      match.odds.team2.back = clamp(match.odds.team2.back, 1.01, 6.00);
      match.odds.team2.lay  = clamp(match.odds.team2.lay,  match.odds.team2.back + 0.02, 6.50);

      // Nudge fancy market YES/NO values for LIVE matches (simulate real-time rate changes)
      const fancyNudge = () => Math.floor((Math.random() - 0.5) * 4); // ±0–2 integer
      match.fancyMarkets.forEach(fm => {
        if (fm.result === "PENDING" && !fm.suspended) {
          fm.yesValue = Math.max(0, fm.yesValue + fancyNudge());
          fm.noValue  = Math.max(0, fm.noValue  + fancyNudge());
        }
      });

      await match.save();

      io.emit("match:odds_tick", {
        matchId: match._id.toString(),
        odds:    { team1: match.odds.team1, team2: match.odds.team2, draw: match.odds.draw },
        score:   match.score,
      });

      // Broadcast updated fancy rates to all clients
      if (match.fancyMarkets.length > 0) {
        io.emit("match:fancy_tick", {
          matchId:      match._id.toString(),
          fancyMarkets: match.fancyMarkets,
        });
      }
    }
  } catch (err) {
    // Silent fail — this is a background tick
  }
};

// ── GET /api/matches/cricket-proxy ───────────────────────────────────────────
// Proxy to external cricket API — hides API key from frontend.
exports.cricketProxy = async (req, res) => {
  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: "endpoint query param required" });

  const ALLOWED_PREFIXES = ["/matches", "/series", "/schedule", "/score", "/live", "/upcoming"];
  const isAllowed = ALLOWED_PREFIXES.some(p => endpoint.startsWith(p));
  if (!isAllowed) return res.status(403).json({ error: "Endpoint not permitted" });

  const RAPID_KEY = process.env.RAPIDAPI_CRICKET_KEY || "";
  const HOST      = "cricket-api-free-data.p.rapidapi.com";
  const url       = `https://${HOST}${endpoint}`;

  try {
    const upstream = await fetch(url, {
      headers: { "X-RapidAPI-Key": RAPID_KEY, "X-RapidAPI-Host": HOST },
    });
    const data = await upstream.json();
    res.setHeader("Cache-Control", "public, max-age=30");
    return res.json(data);
  } catch (err) {
    console.error("Cricket proxy error:", err.message);
    return res.status(502).json({ error: "Upstream cricket API unavailable", detail: err.message });
  }
};

