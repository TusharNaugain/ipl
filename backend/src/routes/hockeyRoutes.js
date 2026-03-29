const express = require('express');
const router = express.Router();
const hockeyController = require('../controllers/hockeyController');

router.get('/live', hockeyController.getLiveHockeyMatches);

module.exports = router;
