const express = require('express');
const router = express.Router();
const esportsController = require('../controllers/esportsController');

router.get('/live', esportsController.getLiveEsportsMatches);

module.exports = router;
