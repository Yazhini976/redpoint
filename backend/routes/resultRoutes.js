const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', resultController.getAllResults);
router.post('/', verifyToken, isAdmin, resultController.createOrUpdateResult);
router.put('/:id', verifyToken, isAdmin, resultController.updateResultById);
router.delete('/:id', verifyToken, isAdmin, resultController.deleteResult);

module.exports = router;
