/**
 * gameController.js — Handles casino game result settlement
 * POST /api/games/play  — deducts stake, adds winnings, logs transaction
 */
const User        = require("../models/User");
const Transaction = require("../models/Transaction");

exports.playGame = async (req, res) => {
  try {
    const { gameId, stake, won, winAmount } = req.body;
    const userId = req.user.id;

    if (!gameId || !stake || stake <= 0) {
      return res.status(400).json({ error: "Invalid game params" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.coins < stake) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct stake first
    user.coins -= stake;

    // If won, credit winAmount
    const payout = won ? winAmount : 0;
    if (won && payout > 0) user.coins += payout;

    await user.save();

    // Log transaction
    await Transaction.create({
      userId,
      type:        won ? "WIN" : "DEBIT",
      amount:      won ? payout - stake : stake,
      description: `${gameId}: ${won ? `Won ₹${payout}` : `Lost ₹${stake}`}`,
      balanceAfter: user.coins,
    });

    // Emit wallet update via WebSocket if io is available
    const io = req.app.get("io");
    if (io) io.emit("wallet:update", { userId, coins: user.coins });

    return res.json({
      success: true,
      won,
      stake,
      payout,
      profit:  won ? payout - stake : -stake,
      balance: user.coins,
    });
  } catch (err) {
    console.error("Game play error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("coins");
    return res.json({ balance: user.coins });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getSpribeAviator = async (req, res) => {
  try {
    // Using the public demo URL that doesn't require operator auth keys
    const demoUrl = `https://demo.spribe.io/launch/aviator?currency=INR&lang=EN`;
    return res.json({ url: demoUrl });
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate game URL" });
  }
};
