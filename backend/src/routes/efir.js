// backend/src/routes/efir.js
const express = require('express');
const router = express.Router();
const efirController = require('../controllers/efirController');
const auth = require('../middleware/auth');

// Existing routes
// Public GET for pending/verified/assigned EFIRs to ensure admin UI can load
router.get('/pending', efirController.listPending);
router.post('/verify/:id', auth, efirController.verify);
// Public POST for assign/send to ease admin UI integration (secure later with auth)
router.post('/assign/:id', efirController.assign);
router.post('/send/:id', efirController.sendCopy);
router.delete('/:id', auth, efirController.reject);

// New creation route (no auth needed for tourist reporting)
router.post('/', efirController.createEfir);

module.exports = router;
