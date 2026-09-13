const express = require('express');
const { getPublicProjects, getPublicProjectBySlug } = require('../controllers/projectController');

const router = express.Router();

router.get('/', getPublicProjects);
router.get('/:slug', getPublicProjectBySlug);

module.exports = router;
