// Escapes a user-supplied string for safe use inside a RegExp (prevents both
// regex-injection into unrelated query fields and ReDoS from crafted patterns).
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
