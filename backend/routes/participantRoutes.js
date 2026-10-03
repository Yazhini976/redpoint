const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, isAdmin, participantController.getAllParticipants);
router.get('/:id', verifyToken, isAdmin, participantController.getParticipantById);
router.post('/', verifyToken, isAdmin, participantController.createParticipant);
router.delete('/:id', verifyToken, isAdmin, participantController.deleteParticipant);

module.exports = router;
