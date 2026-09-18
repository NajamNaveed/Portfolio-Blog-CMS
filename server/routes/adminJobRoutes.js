const express = require('express');
const {
  getCriteria,
  updateCriteria,
  getJobs,
  updateJobStatus,
  blockCompany,
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
router.post('/:id/block-company', blockCompany);
router.delete('/:id', deleteJob);
router.post('/run', runNow);

module.exports = router;
