const express = require('express');
const { trackEvent } = require('../controllers/analyticsController');
const { trackLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/track', trackLimiter, trackEvent);

module.exports = router;
