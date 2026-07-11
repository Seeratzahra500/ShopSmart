const nodemailer = require('nodemailer');

// Lazy-created transport: only built the first time a send is attempted, and
// only if SMTP_HOST is configured. Keeps dev/test environments (no SMTP env
// vars set) completely unaffected — every send becomes a logged no-op.
let transporter;
let warned = false;

function getTransporter() {
  if (!process.env.SMTP_HOST) {
    if (!warned) {
      console.log('[mailer] SMTP not configured — skipping email');
      warned = true;
    }
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

function formatMoney(amount, store) {
  try {
    return new Intl.NumberFormat(store?.locale, {
      style: 'currency',
      currency: store?.currency,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

function shortId(order) {
  const id = order?._id ? String(order._id) : '';
  return id ? id.slice(-8).toUpperCase() : '';
}

function itemsRows(order, store) {
  return (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.title} &times; ${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatMoney(item.price * item.quantity, store)}</td>
      </tr>`
    )
    .join('');
}

function buildEmailHtml({ store, order, heading, statusLine }) {
  const brandColor = store?.primaryColor || '#5C4E4E';
  const storeName = store?.name || 'ShopSmart';
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#222;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="background:${brandColor};padding:20px;border-radius:6px 6px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:20px;">${storeName}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:20px;border:1px solid #eee;border-top:none;">
          <h2 style="margin-top:0;font-size:18px;">${heading}</h2>
          <p style="color:#555;margin:0 0 16px;">Order #${shortId(order)}</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            ${itemsRows(order, store)}
            <tr>
              <td style="padding:12px 0 0;font-weight:bold;">Total</td>
              <td style="padding:12px 0 0;font-weight:bold;text-align:right;">${formatMoney(order.totalAmount, store)}</td>
            </tr>
          </table>
          <p style="margin:0 0 4px;"><strong>Status:</strong> ${statusLine}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px;text-align:center;color:#999;font-size:12px;">
          Sold via ShopSmart
        </td>
      </tr>
    </table>
  </div>`;
}

async function send({ to, subject, html }) {
  const t = getTransporter();
  if (!t || !to) return;
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

exports.sendOrderConfirmation = function sendOrderConfirmation(order, store, recipientEmail) {
  if (!recipientEmail) return Promise.resolve();
  const storeName = store?.name || 'ShopSmart';
  const html = buildEmailHtml({
    store,
    order,
    heading: 'Order confirmed',
    statusLine: 'pending',
  });
  return send({
    to: recipientEmail,
    subject: `Order confirmed — ${storeName}`,
    html,
  }).catch((err) => console.error('[mailer]', err.message));
};

exports.sendOrderStatusUpdate = function sendOrderStatusUpdate(order, store, recipientEmail) {
  if (!recipientEmail) return Promise.resolve();
  const storeName = store?.name || 'ShopSmart';
  const status = order?.status || '';
  const html = buildEmailHtml({
    store,
    order,
    heading: `Your order is ${status}`,
    statusLine: status,
  });
  return send({
    to: recipientEmail,
    subject: `Your order is ${status} — ${storeName}`,
    html,
  }).catch((err) => console.error('[mailer]', err.message));
};
