const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const productController = require('../controllers/product.controller');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const productValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  validate,
];

router.get('/',     productController.getProducts);
router.get('/:id',  productController.getProduct);
router.post('/',    verifyToken, requireRole('admin'), productValidation, productController.createProduct);
router.put('/:id',  verifyToken, requireRole('admin'), productController.updateProduct);
router.delete('/:id', verifyToken, requireRole('admin'), productController.deleteProduct);

module.exports = router;
