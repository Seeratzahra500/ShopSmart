const router = require('express').Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const adminController = require('../controllers/admin.controller');
const orderController = require('../controllers/order.controller');

router.use(verifyToken, requireRole('admin'));

router.get('/analytics',               adminController.getAnalytics);
router.get('/users',                   adminController.getAllUsers);
router.patch('/users/:id/status',      adminController.toggleUserStatus);
router.patch('/users/:id/role',        adminController.changeUserRole);
router.get('/orders',                  adminController.getAllOrders);
// Delegates to order.controller's updateOrderStatus (already handles the
// admin branch) so admin doesn't bypass status-transition/restock rules
// through a second, unvalidated copy of this logic.
router.patch('/orders/:id/status',     orderController.updateOrderStatus);
router.get('/stores',                  adminController.getAllStores);
router.patch('/stores/:id/status',     adminController.toggleStoreStatus);
router.delete('/stores/:id',           adminController.deleteStore);

module.exports = router;
