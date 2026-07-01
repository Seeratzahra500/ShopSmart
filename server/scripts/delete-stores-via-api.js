const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@shopsmart.com';
const ADMIN_PASSWORD = 'Admin@1234';
const STORE_NAMES = ['awikwok', 'my shop', 'This Store'];

function getCookieHeader(setCookieHeader) {
  if (!setCookieHeader) return '';
  if (Array.isArray(setCookieHeader)) {
    return setCookieHeader.map(h => h.split(';')[0]).join('; ');
  }
  return String(setCookieHeader).split(',').map(h => h.split(';')[0]).join('; ');
}

(async () => {
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, await loginRes.text());
    process.exit(1);
  }

  const setCookieHeader = loginRes.headers.get('set-cookie') || loginRes.headers.get('Set-Cookie');
  const cookieHeader = getCookieHeader(setCookieHeader);
  if (!cookieHeader) {
    console.error('No cookies returned from login.');
    process.exit(1);
  }

  const storesRes = await fetch(`${BASE_URL}/api/stores`, {
    headers: { Cookie: cookieHeader },
  });
  if (!storesRes.ok) {
    console.error('Failed to fetch stores:', storesRes.status, await storesRes.text());
    process.exit(1);
  }

  const { stores } = await storesRes.json();
  const toDelete = stores.filter(s => STORE_NAMES.includes(s.name));
  if (!toDelete.length) {
    console.log('No matching stores found to delete.');
    return;
  }

  for (const store of toDelete) {
    const deleteRes = await fetch(`${BASE_URL}/api/admin/stores/${store._id}`, {
      method: 'DELETE',
      headers: { Cookie: cookieHeader },
    });
    const text = await deleteRes.text();
    if (!deleteRes.ok) {
      console.error(`Failed to delete ${store.name}:`, deleteRes.status, text);
    } else {
      console.log(`Deleted ${store.name} (${store.slug})`);
    }
  }
})();
