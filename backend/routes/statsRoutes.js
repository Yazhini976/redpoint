const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verifyToken, isAdmin, isParticipant } = require('../middleware/authMiddleware');

router.get('/admin', verifyToken, isAdmin, statsController.getAdminStats);
router.get('/participant', verifyToken, isParticipant, statsController.getParticipantStats);

module.exports = router;
