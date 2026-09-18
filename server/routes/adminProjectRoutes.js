const express = require('express');
const {
  getAdminProjects,
  getAdminProjectById,
  createProject,
  updateProject,
  deleteProject,
  publishProject,
  unpublishProject,
  draftProjectFromRepo,
} = require('../controllers/projectController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/', getAdminProjects);
router.get('/:id', getAdminProjectById);
router.post('/', createProject);
router.post('/draft-from-repo', draftProjectFromRepo);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.patch('/:id/publish', publishProject);
router.patch('/:id/unpublish', unpublishProject);

module.exports = router;
