const router = require('express').Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const storeController = require('../controllers/store.controller');

// Public
router.get('/default',   storeController.getDefault);
router.get('/:slug',     storeController.getBySlug);

// Admin only
router.get('/mine/data', verifyToken, requireRole('admin'), storeController.getMine);
router.patch('/:id',     verifyToken, requireRole('admin'), storeController.updateStore);

module.exports = router;
