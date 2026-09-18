const express = require('express');
const { viewSharedJobs } = require('../controllers/jobShareController');
const { sharedViewLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/:token', sharedViewLimiter, viewSharedJobs);

module.exports = router;
