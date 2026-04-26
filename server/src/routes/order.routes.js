const router = require('express').Router();
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

router.post('/',      optionalAuth, orderController.createOrder);
router.get('/my',     verifyToken,  orderController.getUserOrders);
router.get('/:id',    optionalAuth, orderController.getOrder);

module.exports = router;
