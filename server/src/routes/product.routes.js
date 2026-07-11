const router = require('express').Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate');
const productController = require('../controllers/product.controller');

const productValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  validate,
];

const productUpdateValidation = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  validate,
];

router.get('/',     productController.getProducts);
router.get('/:id',  productController.getProduct);
router.post('/',    verifyToken, requireRole('shopowner', 'admin'), productValidation, productController.createProduct);
router.put('/:id',  verifyToken, requireRole('shopowner', 'admin'), productUpdateValidation, productController.updateProduct);
router.delete('/:id', verifyToken, requireRole('shopowner', 'admin'), productController.deleteProduct);

module.exports = router;
