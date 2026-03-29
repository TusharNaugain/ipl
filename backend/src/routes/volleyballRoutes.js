const express = require('express');
const router = express.Router();
const volleyballController = require('../controllers/volleyballController');

router.get('/live', volleyballController.getLiveVolleyballMatches);

module.exports = router;
