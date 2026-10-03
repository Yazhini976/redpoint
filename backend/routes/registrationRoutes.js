const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, registrationController.registerForTournament);
router.get('/my', verifyToken, registrationController.getMyRegistrations);
router.get('/tournament/:tournamentId', verifyToken, registrationController.getTournamentRegistrations);
router.delete('/:id', verifyToken, registrationController.cancelRegistration);

module.exports = router;
