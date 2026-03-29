const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ── Input validators ──
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitizeStr = (str) => (str || "").trim().slice(0, 100); // cap length, trim whitespace

/**
 * POST /api/auth/register
 * Secured: input validation, email normalization, bcrypt cost 12, no role escalation
 */
exports.register = async (req, res) => {
  try {
    const name = sanitizeStr(req.body.name);
    const email = sanitizeStr(req.body.email).toLowerCase();
    const password = req.body.password || "";
    const role = req.body.role || "USER";

    // ── Validation ──
    if (!name || name.length < 2)      return res.status(400).json({ error: "Name must be at least 2 characters" });
    if (!isValidEmail(email))           return res.status(400).json({ error: "Invalid email format" });
    if (password.length < 6)            return res.status(400).json({ error: "Password must be at least 6 characters" });

    // ── Prevent self-registration as ADMIN (critical security) ──
    const allowedSelfRegisterRoles = ["USER"];
    if (!allowedSelfRegisterRoles.includes(role)) {
      return res.status(403).json({ error: "Cannot self-register with this role" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    // bcrypt cost 12 (stronger than default 10)
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, role });

    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

/**
 * POST /api/auth/login
 * Secured: constant-time comparison, generic error messages, no user existence leak
 */
exports.login = async (req, res) => {
  try {
    const email = sanitizeStr(req.body.email).toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });

    // Use same generic message for "not found" AND "wrong password" → prevents enumeration
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // JWT with shorter expiry + only essential claims
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }   // 24h instead of 7d (more secure)
    );

    // Never send password hash or internal fields to client
    res.json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        coins: user.coins,
        isVIP: user.isVIP || false,
      }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * GET /api/auth/me
 * Returns current user (without password)
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GetMe error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
