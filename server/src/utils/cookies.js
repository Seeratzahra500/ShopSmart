// Single source of truth for cookie flags so login/refresh/logout can't drift
// out of sync (e.g. one path forgetting the Railway secure-cookie check).
function cookieOptions() {
  const secure = process.env.NODE_ENV === 'production'
    || !!process.env.RAILWAY_ENVIRONMENT_NAME
    || process.env.SECURE_COOKIES === 'true';
  return { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax' };
}

module.exports = { cookieOptions };
