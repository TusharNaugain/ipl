const express = require("express");
const router = express.Router();
const { getLiveScores } = require("../controllers/soccerController");

router.get("/live", getLiveScores);

module.exports = router;
