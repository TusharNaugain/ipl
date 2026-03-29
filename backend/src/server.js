const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ 🔒 SECURITY — Helmet, CORS, Rate Limiting, Sanitization                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// Helmet — sets secure HTTP headers (XSS protection, no sniff, HSTS, etc.)
app.use(helmet({
  contentSecurityPolicy: false,   // disabled for API (no HTML served)
  crossOriginEmbedderPolicy: false,
}));

// Remove X-Powered-By header completely (hides Express fingerprint)
app.disable("x-powered-by");

// ── CORS: flexible local origin locking ──
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
      return callback(null, true);
    }
    console.error(`CORS blocked for origin: ${origin}`);
    callback(new Error("CORS blocked"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Rate Limiting ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                   // 200 requests per window per IP
  message: { error: "Too many requests, slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Auth-specific rate limiter (stricter — prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,                    // 15 login/register attempts per 15 min
  message: { error: "Too many login attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Body parsing + sanitization ──
app.use(express.json({ limit: "10kb" }));        // Cap body size to prevent DoS
app.use(mongoSanitize());                         // Prevents NoSQL injection ($gt, $ne, etc.)
app.use(hpp());                                   // Prevents HTTP parameter pollution

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ 🔌 Socket.IO (secured)                                                      ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
const io = require("socket.io")(server, {
  cors: { 
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
        return callback(null, true);
      }
      callback(new Error("CORS blocked"));
    }, 
    methods: ["GET", "POST"], 
    credentials: true 
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Connect Database ──
connectDB();

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ 📡 API Routes                                                               ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
// NOTE: authLimiter only on login/register, NOT on /auth/me (called on every page load)
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/users",       require("./routes/userRoutes"));
app.use("/api/matches",     require("./routes/matchRoutes"));
app.use("/api/bets",        require("./routes/betRoutes"));
app.use("/api/games",       require("./routes/gameRoutes"));

app.use("/api/predictions", require("./routes/predictionRoutes"));
app.use("/api/game",        require("./routes/gameRoutes"));
app.use("/api/cricket",     require("./routes/cricketRoutes"));
app.use("/api/soccer",      require("./routes/soccerRoutes"));
app.use("/api/tennis",      require("./routes/tennisRoutes"));
app.use("/api/basketball",  require("./routes/basketballRoutes"));
app.use("/api/volleyball",  require("./routes/volleyballRoutes"));
app.use("/api/hockey",      require("./routes/hockeyRoutes"));
app.use("/api/esports",     require("./routes/esportsRoutes"));
app.use("/api/sports",      require("./routes/genericSportRoutes"));

// ── Health check (no auth) ──
app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ 🔌 Socket Events — Real-Time Sync (User ↔ Admin)                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
io.on("connection", (socket) => {
  // Admin pushes a new prediction live → all connected users see it
  socket.on("admin:prediction", (data) => {
    io.emit("prediction:live", data);
  });

  // When user plays a game → broadcast to admin dashboards
  socket.on("game:played", (data) => {
    io.emit("admin:game-activity", data);
  });

  // When user places a bet → broadcast to admin
  socket.on("user:bet-placed", (data) => {
    io.emit("admin:bet-placed", data);
  });

  // Subscribe to a specific match room for live odds ticks
  socket.on("match:subscribe", (matchId) => {
    socket.join(`match:${matchId}`);
  });

  socket.on("match:unsubscribe", (matchId) => {
    socket.leave(`match:${matchId}`);
  });
});

// Make io accessible to controllers
app.set("io", io);

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ 📈 LIVE ODDS SIMULATOR — Ticks every 8s for LIVE matches                   ║
// ║    Simulates real market movement until a proper feed is integrated.        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
const { simulateLiveOdds } = require("./controllers/matchController");
setInterval(() => simulateLiveOdds(io), 8000);

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ 🛡️ Global Error Handler — NEVER leak stack traces                          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
app.use((err, req, res, next) => {
  console.error("Unhandled:", err.message);
  res.status(err.status || 500).json({ error: "Something went wrong" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ 🚀 START SERVER                                                             ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
