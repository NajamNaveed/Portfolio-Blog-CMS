const express = require('express');
const {
  getCriteria,
  updateCriteria,
  getJobs,
  updateJobStatus,
  deleteJob,
  runNow,
} = require('../controllers/jobController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/criteria', getCriteria);
router.put('/criteria', updateCriteria);
router.get('/', getJobs);
router.patch('/:id/status', updateJobStatus);
router.delete('/:id', deleteJob);
router.post('/run', runNow);

module.exports = router;
