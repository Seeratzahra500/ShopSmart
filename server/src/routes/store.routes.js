const router = require('express').Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { loadOwnStore } = require('../middleware/store.middleware');
const storeController = require('../controllers/store.controller');

// This router is mounted at /api/store and is exclusively for the logged-in
// shopowner managing their own store. Public browsing (by slug, incl. the
// duplicate that used to live here) lives at /api/stores — see stores.routes.js.
router.get('/analytics',  verifyToken, requireRole('shopowner', 'admin'), loadOwnStore, storeController.getAnalytics);
router.get('/products',   verifyToken, requireRole('shopowner', 'admin'), loadOwnStore, storeController.getOwnProducts);
router.get('/mine/data',  verifyToken, requireRole('shopowner', 'admin'), storeController.getMine);
router.patch('/:id',      verifyToken, requireRole('shopowner', 'admin'), storeController.updateStore);

module.exports = router;
