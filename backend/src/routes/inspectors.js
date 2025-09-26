const express = require('express');
const router = express.Router();
const controller = require('../controllers/inspectorController');
const auth = require('../middleware/auth');

// Public GET for listing inspectors (no auth) to ensure dropdown loads in admin UI
router.get('/', controller.listAvailable);

module.exports = router;


