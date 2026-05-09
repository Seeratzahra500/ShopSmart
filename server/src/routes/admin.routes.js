const router = require('express').Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const adminController = require('../controllers/admin.controller');

router.use(verifyToken, requireRole('admin'));

router.get('/analytics',               adminController.getAnalytics);
router.get('/users',                   adminController.getAllUsers);
router.patch('/users/:id/status',      adminController.toggleUserStatus);
router.get('/orders',                  adminController.getAllOrders);
router.patch('/orders/:id/status',     adminController.updateOrderStatus);
router.get('/stores',                  adminController.getAllStores);
router.patch('/stores/:id/status',     adminController.toggleStoreStatus);

module.exports = router;
