const crypto = require('crypto');
const Store  = require('../models/Store');

// GET /api/uploads/signature — issues a short-lived signature for a
// direct-to-Cloudinary browser upload. The server never touches the file
// itself; it only signs the params the client will send to Cloudinary.
exports.getSignature = async (req, res) => {
  try {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return res.status(503).json({ message: 'Image uploads are not configured on this server.' });
    }

    const store  = await Store.findOne({ owner: req.user.id });
    const folder = store ? `shopsmart/${store.slug}` : 'shopsmart/misc';
    const timestamp = Math.floor(Date.now() / 1000);

    // Cloudinary signature: sort the params to sign alphabetically, join as
    // key=value pairs with '&', append the API secret, then SHA-1 hex digest.
    const paramsToSign = { folder, timestamp };
    const toSign = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&');
    const signature = crypto
      .createHash('sha1')
      .update(toSign + CLOUDINARY_API_SECRET)
      .digest('hex');

    res.json({
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey:    CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
