const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const bc   = require("../controllers/betController");

// All bet routes require authentication
router.post("/",               auth, (req, res) => bc.placeBet(req.app.get("io"))(req, res));
router.get("/",                auth, bc.getBets);
router.get("/stats",           auth, bc.getBetStats);
router.get("/match/:matchId",  auth, bc.getBetsByMatch);

module.exports = router;
