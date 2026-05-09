const router = require('express').Router();
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const storeController  = require('../controllers/store.controller');
const reviewController = require('../controllers/review.controller');

// Store browsing
router.get('/',                          storeController.listStores);
router.get('/:slug',                     storeController.getBySlug);
router.get('/:slug/products',            storeController.getStoreProducts);
router.get('/:slug/products/:id',        storeController.getStoreProduct);

// Reviews
router.get( '/:slug/products/:id/reviews',            reviewController.getReviews);
router.post('/:slug/products/:id/reviews', verifyToken, requireRole('customer'), reviewController.addReview);
router.delete('/:slug/products/:id/reviews/:reviewId', verifyToken, reviewController.deleteReview);

module.exports = router;
