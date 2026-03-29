const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const mc   = require("../controllers/matchController");

// Public — no auth needed
router.get("/",              mc.getMatches);
router.get("/live",          mc.getLiveMatches);
router.get("/cricket-proxy", mc.cricketProxy);
router.get("/:id",           mc.getMatchById);

// Admin-protected (auth required)
router.post("/",              auth, mc.createMatch);
router.patch("/:id",         (req, res, next) => { req.io = req.app.get("io"); next(); },
                              auth, (req, res) => mc.updateMatch(req.app.get("io"))(req, res));
router.post("/:id/settle",   auth, (req, res) => mc.settleMatch(req.app.get("io"))(req, res));

// Fancy market settlement
router.post("/:id/fancy/:fancyId/settle", auth, (req, res) => mc.settleFancy(req.app.get("io"))(req, res));

module.exports = router;

