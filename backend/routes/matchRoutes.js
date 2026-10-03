const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', matchController.getAllMatches);
router.get('/:id', matchController.getMatchById);
router.post('/', verifyToken, isAdmin, matchController.createMatch);
router.put('/:id', verifyToken, isAdmin, matchController.updateMatch);
router.delete('/:id', verifyToken, isAdmin, matchController.deleteMatch);

module.exports = router;
