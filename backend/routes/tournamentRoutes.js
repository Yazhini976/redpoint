const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', tournamentController.getAllTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.post('/', verifyToken, isAdmin, tournamentController.createTournament);
router.put('/:id', verifyToken, isAdmin, tournamentController.updateTournament);
router.delete('/:id', verifyToken, isAdmin, tournamentController.deleteTournament);

module.exports = router;
