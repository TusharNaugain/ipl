/**
 * Seed Script — IPL 2026 Full Schedule + Users
 * Run: node backend/src/seed.js
 *
 * Generates matches with realistic Back/Lay odds for each team.
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Match = require("./models/Match");
const User  = require("./models/User");
const bcrypt = require("bcryptjs");

// Helper — randomise odds slightly for realism
function mkOdds(fav, under) {
  const spread = 0.02;
  return {
    team1: { back: fav,          lay: +(fav   + spread).toFixed(2), volume: Math.floor(Math.random() * 2000000) },
    team2: { back: under,        lay: +(under + spread).toFixed(2), volume: Math.floor(Math.random() * 2000000) },
    draw:  { back: 0,            lay: 0,                             volume: 0 }, // Cricket T20 — no draw
  };
}

const VENUES = {
  CSK:  "MA Chidambaram Stadium, Chennai",
  MI:   "Wankhede Stadium, Mumbai",
  RCB:  "M Chinnaswamy Stadium, Bangalore",
  KKR:  "Eden Gardens, Kolkata",
  SRH:  "Rajiv Gandhi Intl Stadium, Hyderabad",
  DC:   "Arun Jaitley Stadium, Delhi",
  PBKS: "PCA Stadium, Mohali",
  RR:   "Sawai Mansingh Stadium, Jaipur",
  GT:   "Narendra Modi Stadium, Ahmedabad",
  LSG:  "BRSABV Ekana Stadium, Lucknow",
};

// Full IPL 2026 schedule with realistic odds
const IPL_2026 = [
  // IPL 2026 Season — starts March 28, 2026 (all UPCOMING)
  { d:"2026-03-28",t:"15:30", t1:"DC",   t2:"GT",   status:"UPCOMING", o:mkOdds(1.95,1.96) },
  { d:"2026-03-28",t:"19:30", t1:"LSG",  t2:"PBKS", status:"UPCOMING", o:mkOdds(1.90,2.02) },
  { d:"2026-03-29",t:"19:30", t1:"MI",   t2:"RR",   status:"UPCOMING", o:mkOdds(1.78,2.12) },
  { d:"2026-03-30",t:"15:30", t1:"CSK",  t2:"DC",   status:"UPCOMING", o:mkOdds(1.85,2.06) },
  { d:"2026-03-30",t:"19:30", t1:"KKR",  t2:"GT",   status:"UPCOMING", o:mkOdds(1.82,2.10) },
  { d:"2026-03-31",t:"19:30", t1:"SRH",  t2:"LSG",  status:"UPCOMING", o:mkOdds(1.88,2.02) },
  { d:"2026-04-01",t:"19:30", t1:"PBKS", t2:"RCB",  status:"UPCOMING", o:mkOdds(2.10,1.82) },
  { d:"2026-04-02",t:"19:30", t1:"RR",   t2:"MI",   status:"UPCOMING", o:mkOdds(2.02,1.88) },
  { d:"2026-04-03",t:"19:30", t1:"GT",   t2:"CSK",  status:"UPCOMING", o:mkOdds(2.00,1.90) },
  { d:"2026-04-04",t:"15:30", t1:"DC",   t2:"KKR",  status:"UPCOMING", o:mkOdds(2.08,1.84) },
  { d:"2026-04-04",t:"19:30", t1:"LSG",  t2:"RCB",  status:"UPCOMING", o:mkOdds(2.12,1.80) },
  { d:"2026-04-05",t:"19:30", t1:"MI",   t2:"SRH",  status:"UPCOMING", o:mkOdds(1.90,2.00) },
  { d:"2026-04-06",t:"19:30", t1:"RCB",  t2:"RR",   status:"UPCOMING", o:mkOdds(1.78,2.12) },
  { d:"2026-04-07",t:"19:30", t1:"CSK",  t2:"PBKS", status:"UPCOMING", o:mkOdds(1.82,2.10) },
  { d:"2026-04-08",t:"19:30", t1:"KKR",  t2:"LSG",  status:"UPCOMING", o:mkOdds(1.85,2.06) },
  { d:"2026-04-09",t:"19:30", t1:"GT",   t2:"SRH",  status:"UPCOMING", o:mkOdds(2.00,1.90) },
  { d:"2026-04-10",t:"19:30", t1:"DC",   t2:"RCB",  status:"UPCOMING", o:mkOdds(2.20,1.74) },
  { d:"2026-04-11",t:"15:30", t1:"PBKS", t2:"MI",   status:"UPCOMING", o:mkOdds(2.04,1.88) },
  { d:"2026-04-11",t:"19:30", t1:"RR",   t2:"KKR",  status:"UPCOMING", o:mkOdds(2.08,1.84) },
  { d:"2026-04-12",t:"15:30", t1:"LSG",  t2:"GT",   status:"UPCOMING", o:mkOdds(1.96,1.96) },
  { d:"2026-04-12",t:"19:30", t1:"SRH",  t2:"DC",   status:"UPCOMING", o:mkOdds(1.80,2.10) },
  { d:"2026-04-13",t:"19:30", t1:"MI",   t2:"CSK",  status:"UPCOMING", o:mkOdds(1.88,2.02) },
  { d:"2026-04-14",t:"19:30", t1:"RCB",  t2:"PBKS", status:"UPCOMING", o:mkOdds(1.75,2.16) },
  { d:"2026-04-15",t:"19:30", t1:"KKR",  t2:"RR",   status:"UPCOMING", o:mkOdds(1.82,2.10) },
  { d:"2026-04-16",t:"19:30", t1:"CSK",  t2:"GT",   status:"UPCOMING", o:mkOdds(1.92,1.98) },
  { d:"2026-04-17",t:"19:30", t1:"SRH",  t2:"MI",   status:"UPCOMING", o:mkOdds(1.96,1.96) },
  { d:"2026-04-18",t:"15:30", t1:"DC",   t2:"LSG",  status:"UPCOMING", o:mkOdds(2.02,1.90) },
  { d:"2026-04-18",t:"19:30", t1:"RR",   t2:"RCB",  status:"UPCOMING", o:mkOdds(2.12,1.80) },
  { d:"2026-04-19",t:"19:30", t1:"PBKS", t2:"KKR",  status:"UPCOMING", o:mkOdds(2.10,1.82) },
  { d:"2026-04-20",t:"15:30", t1:"GT",   t2:"DC",   status:"UPCOMING", o:mkOdds(1.95,1.97) },
  { d:"2026-04-20",t:"19:30", t1:"MI",   t2:"LSG",  status:"UPCOMING", o:mkOdds(1.80,2.12) },
  { d:"2026-04-21",t:"19:30", t1:"CSK",  t2:"SRH",  status:"UPCOMING", o:mkOdds(1.92,1.98) },
  { d:"2026-04-22",t:"19:30", t1:"RCB",  t2:"GT",   status:"UPCOMING", o:mkOdds(1.78,2.14) },
  { d:"2026-04-23",t:"19:30", t1:"KKR",  t2:"PBKS", status:"UPCOMING", o:mkOdds(1.85,2.06) },
  { d:"2026-04-24",t:"19:30", t1:"RR",   t2:"DC",   status:"UPCOMING", o:mkOdds(2.00,1.90) },
  { d:"2026-04-25",t:"15:30", t1:"LSG",  t2:"CSK",  status:"UPCOMING", o:mkOdds(2.14,1.78) },
  { d:"2026-04-25",t:"19:30", t1:"SRH",  t2:"RCB",  status:"UPCOMING", o:mkOdds(1.90,2.00) },
  { d:"2026-04-26",t:"19:30", t1:"MI",   t2:"KKR",  status:"UPCOMING", o:mkOdds(1.82,2.10) },
  { d:"2026-04-27",t:"19:30", t1:"GT",   t2:"PBKS", status:"UPCOMING", o:mkOdds(1.96,1.96) },
  { d:"2026-04-28",t:"19:30", t1:"DC",   t2:"RR",   status:"UPCOMING", o:mkOdds(2.06,1.86) },
  { d:"2026-04-29",t:"15:30", t1:"CSK",  t2:"KKR",  status:"UPCOMING", o:mkOdds(1.88,2.02) },
  { d:"2026-04-29",t:"19:30", t1:"PBKS", t2:"SRH",  status:"UPCOMING", o:mkOdds(2.08,1.84) },
  { d:"2026-04-30",t:"19:30", t1:"RCB",  t2:"MI",   status:"UPCOMING", o:mkOdds(1.85,2.06) },
  { d:"2026-05-01",t:"19:30", t1:"LSG",  t2:"RR",   status:"UPCOMING", o:mkOdds(1.98,1.92) },
  { d:"2026-05-02",t:"19:30", t1:"KKR",  t2:"DC",   status:"UPCOMING", o:mkOdds(1.80,2.12) },
  { d:"2026-05-03",t:"15:30", t1:"GT",   t2:"RR",   status:"UPCOMING", o:mkOdds(1.96,1.96) },
  { d:"2026-05-03",t:"19:30", t1:"SRH",  t2:"PBKS", status:"UPCOMING", o:mkOdds(1.82,2.10) },
  { d:"2026-05-04",t:"19:30", t1:"MI",   t2:"GT",   status:"UPCOMING", o:mkOdds(1.88,2.02) },
  { d:"2026-05-05",t:"19:30", t1:"CSK",  t2:"RR",   status:"UPCOMING", o:mkOdds(1.90,2.00) },
  { d:"2026-05-06",t:"19:30", t1:"DC",   t2:"SRH",  status:"UPCOMING", o:mkOdds(2.10,1.82) },
  { d:"2026-05-07",t:"19:30", t1:"PBKS", t2:"LSG",  status:"UPCOMING", o:mkOdds(2.02,1.90) },
  { d:"2026-05-08",t:"19:30", t1:"RCB",  t2:"CSK",  status:"UPCOMING", o:mkOdds(1.80,2.12) },
  { d:"2026-05-09",t:"15:30", t1:"KKR",  t2:"MI",   status:"UPCOMING", o:mkOdds(1.85,2.06) },
  { d:"2026-05-09",t:"19:30", t1:"RR",   t2:"SRH",  status:"UPCOMING", o:mkOdds(2.06,1.86) },
  { d:"2026-05-10",t:"19:30", t1:"GT",   t2:"LSG",  status:"UPCOMING", o:mkOdds(1.96,1.96) },
  { d:"2026-05-11",t:"19:30", t1:"DC",   t2:"PBKS", status:"UPCOMING", o:mkOdds(2.02,1.90) },
  { d:"2026-05-12",t:"19:30", t1:"MI",   t2:"DC",   status:"UPCOMING", o:mkOdds(1.82,2.10) },
  { d:"2026-05-13",t:"19:30", t1:"CSK",  t2:"LSG",  status:"UPCOMING", o:mkOdds(1.88,2.02) },
  { d:"2026-05-14",t:"19:30", t1:"SRH",  t2:"RR",   status:"UPCOMING", o:mkOdds(1.90,2.00) },
  { d:"2026-05-15",t:"19:30", t1:"RCB",  t2:"DC",   status:"UPCOMING", o:mkOdds(1.78,2.14) },
  { d:"2026-05-16",t:"15:30", t1:"KKR",  t2:"CSK",  status:"UPCOMING", o:mkOdds(1.85,2.06) },
  { d:"2026-05-16",t:"19:30", t1:"GT",   t2:"RR",   status:"UPCOMING", o:mkOdds(2.00,1.90) },
  // Playoffs
  { d:"2026-05-20",t:"19:30", t1:"TBD",  t2:"TBD",  status:"UPCOMING", competition:"Qualifier 1",          o:mkOdds(1.90,1.90) },
  { d:"2026-05-21",t:"19:30", t1:"TBD",  t2:"TBD",  status:"UPCOMING", competition:"Eliminator",            o:mkOdds(1.90,1.90) },
  { d:"2026-05-23",t:"19:30", t1:"TBD",  t2:"TBD",  status:"UPCOMING", competition:"Qualifier 2",           o:mkOdds(1.90,1.90) },
  { d:"2026-05-25",t:"19:30", t1:"TBD",  t2:"TBD",  status:"UPCOMING", competition:"🏆 IPL 2026 Final",    o:mkOdds(1.90,1.90), venue:"Narendra Modi Stadium, Ahmedabad" },
];

async function seed() {
  await connectDB();

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminExists = await User.findOne({ email: "admin@missio.com" });
  if (!adminExists) {
    const hash = await bcrypt.hash("pass123", 10);
    await User.create({ name: "Admin", email: "admin@missio.com", password: hash, role: "ADMIN", coins: 999999 });
    console.log("✅ Admin created: admin@missio.com / pass123");
  } else {
    console.log("⏭️  Admin already exists");
  }

  const userExists = await User.findOne({ email: "user@missio.com" });
  if (!userExists) {
    const hash = await bcrypt.hash("user123", 10);
    await User.create({ name: "Test User", email: "user@missio.com", password: hash, role: "USER", coins: 10000 });
    console.log("✅ User created: user@missio.com / user123");
  } else {
    console.log("⏭️  Test user already exists");
  }

  // ── Matches ────────────────────────────────────────────────────────────────
  const existingCount = await Match.countDocuments({ sport: "cricket" });
  if (existingCount < 30) {
    await Match.deleteMany({ sport: "cricket" }); // Fresh seed
    const docs = IPL_2026.map(m => ({
      sport:       "cricket",
      competition: m.competition || "IPL T20",
      team1:       m.t1,
      team2:       m.t2,
      venue:       m.venue || VENUES[m.t1] || "",
      scheduledAt: new Date(`${m.d}T${m.t}:00+05:30`),
      status:      m.status,
      winner:      m.winner || null,
      score:       m.score  || "",
      odds:        m.o,
      totalMatched:Math.floor(Math.random() * 5000000),
      source:      "manual",
    }));
    await Match.insertMany(docs);
    console.log(`✅ ${docs.length} IPL 2026 matches seeded with full odds`);
  } else {
    console.log(`⏭️  ${existingCount} matches already in DB — skipping`);
  }

  console.log("\n🎉 Seed complete!");
  process.exit(0);
}

seed().catch(err => { console.error("❌ Seed failed:", err.message); process.exit(1); });
