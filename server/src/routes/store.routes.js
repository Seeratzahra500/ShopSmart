const router = require('express').Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const storeController = require('../controllers/store.controller');

// Public
router.get('/default',    storeController.getDefault);

// Shopowner — static paths must come before /:slug
router.get('/analytics',  verifyToken, requireRole('shopowner', 'admin'), storeController.getAnalytics);
router.get('/products',   verifyToken, requireRole('shopowner', 'admin'), storeController.getOwnProducts);

// Public slug lookup
router.get('/:slug',      storeController.getBySlug);

// Shopowner management (multi-segment paths — no conflict with /:slug)
router.get('/mine/data',  verifyToken, requireRole('shopowner', 'admin'), storeController.getMine);
router.patch('/:id',      verifyToken, requireRole('shopowner', 'admin'), storeController.updateStore);

module.exports = router;
