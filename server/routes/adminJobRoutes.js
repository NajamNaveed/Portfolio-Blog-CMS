const express = require('express');
const {
  getCriteria,
  updateCriteria,
  toggleAutoFetch,
  getJobs,
  updateJobStatus,
  blockCompany,
  deleteJob,
  deleteAllJobs,
  deleteExpiredJobs,
  addManualJob,
  runNow,
} = require('../controllers/jobController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/criteria', getCriteria);
router.put('/criteria', updateCriteria);
router.patch('/criteria/auto-fetch', toggleAutoFetch);
router.get('/', getJobs);
router.post('/manual', addManualJob);
router.patch('/:id/status', updateJobStatus);
router.post('/:id/block-company', blockCompany);
// Literal paths registered BEFORE /:id so "all"/"expired" are never
// mistaken for a job's ObjectId by Express's route matcher.
router.delete('/all', deleteAllJobs);
router.delete('/expired', deleteExpiredJobs);
router.delete('/:id', deleteJob);
router.post('/run', runNow);

module.exports = router;