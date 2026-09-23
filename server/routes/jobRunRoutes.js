const express = require('express');
const { runFromCron } = require('../controllers/jobController');
const { verifyCronSecret } = require('../middleware/verifyCronSecret');
const { cronRunLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/run', cronRunLimiter, verifyCronSecret, runFromCron);

module.exports = router;