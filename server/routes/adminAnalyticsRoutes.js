const express = require('express');
const { getSummary } = require('../controllers/analyticsController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/summary', getSummary);

module.exports = router;
