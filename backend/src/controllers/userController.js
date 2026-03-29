const User = require("../models/User");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcryptjs");
const { canCreateRole } = require("../middleware/roleMiddleware");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get immediate downline of caller
exports.getDownline = async (req, res) => {
  try {
    const users = await User.find({ parentId: req.user.id }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch downline" });
  }
};

// Create user below you in hierarchy
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, commissionRate } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password, role required" });
    }
    if (!canCreateRole(req.user.role, role)) {
      return res.status(403).json({ error: `Your role (${req.user.role}) cannot create a ${role}` });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hash, role,
      parentId: req.user.id,
      commissionRate: commissionRate || 0
    });

    res.status(201).json({ message: "User created", userId: user._id, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Admin: add coins to any user
exports.addCoins = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "userId and amount required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.coins += amount;
    await user.save();

    await Transaction.create({ userId, type: "CREDIT", amount, description: description || "Admin credit" });

    res.json({ message: "Coins added", coins: user.coins });
  } catch (err) {
    res.status(500).json({ error: "Failed to add coins" });
  }
};

// Grant VIP to user
exports.grantVIP = async (req, res) => {
  try {
    const { userId, days } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isVIP = true;
    user.vipExpiry = new Date(Date.now() + (days || 30) * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({ message: `VIP granted for ${days || 30} days`, expiry: user.vipExpiry });
  } catch (err) {
    res.status(500).json({ error: "Failed to grant VIP" });
  }
};
