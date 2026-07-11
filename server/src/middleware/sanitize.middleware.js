// express-mongo-sanitize mutates req.query in place, which throws under Express 5
// (req.query is a getter-only property there). req.body is a plain object express.json()
// assigns fresh each request, so it's safe to sanitize in place — and it's the only
// place raw user input reaches Mongoose query operators in this app (e.g. forgotPassword).
function stripMongoOperators(value) {
  if (Array.isArray(value)) {
    return value.map(stripMongoOperators);
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      clean[key] = stripMongoOperators(val);
    }
    return clean;
  }
  return value;
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = stripMongoOperators(req.body);
  }
  next();
}

module.exports = { sanitizeBody };
