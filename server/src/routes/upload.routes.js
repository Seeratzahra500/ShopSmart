const router = require('express').Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const uploadController = require('../controllers/upload.controller');

router.get('/signature', verifyToken, requireRole('shopowner', 'admin'), uploadController.getSignature);

module.exports = router;
