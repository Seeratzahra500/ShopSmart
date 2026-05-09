const router = require('express').Router();
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const orderController = require('../controllers/order.controller');

router.post('/',          optionalAuth, orderController.createOrder);
router.get('/my',         verifyToken,  orderController.getUserOrders);
router.get('/store',      verifyToken,  requireRole('shopowner', 'admin'), orderController.getStoreOrders);
router.get('/:id',        optionalAuth, orderController.getOrder);
router.patch('/:id/status', verifyToken, requireRole('shopowner', 'admin'), orderController.updateOrderStatus);

module.exports = router;
