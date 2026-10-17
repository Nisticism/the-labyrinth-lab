const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();
const DEFAULT_CONTACT_EMAIL = process.env.CONTACT_EMAIL || process.env.EMAIL_TO || 'labyrinthlabs0@gmail.com';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendWithSmtp({ name, email, message }) {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return false;
  }

  // The "from" address must be a sender your provider accepts. For Amazon SES
  // this must be a verified identity (domain or email), and it is NOT the SMTP
  // username (which is an access-key-style credential). Allow it to be set
  // explicitly, falling back to the SMTP user only when that looks like an
  // email address (e.g. Gmail SMTP), then to the contact address.
  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.MAIL_FROM ||
    process.env.EMAIL_FROM ||
    (user.includes('@') ? user : DEFAULT_CONTACT_EMAIL);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${name}" <${fromAddress}>`,
    to: DEFAULT_CONTACT_EMAIL,
    replyTo: email,
    subject: `New message from the-ll.com from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Message:',
      message,
    ].join('\n'),
    html: `
      <p><strong>Name:</strong> ${escapeHtml(name)}<br>
      <strong>Email:</strong> ${escapeHtml(email)}</p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
  });

  return true;
}

async function sendWithFormSubmit({ name, email, message }) {
  const url = `https://formsubmit.co/ajax/${encodeURIComponent(DEFAULT_CONTACT_EMAIL)}`;
  const params = new URLSearchParams();
  params.append('name', name);
  params.append('email', email);
  params.append('message', message);
  params.append('_captcha', 'false');
  params.append('_subject', 'New message from the-ll.com');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FormSubmit failed with status ${response.status}: ${text.slice(0, 200)}`);
  }

  return true;
}

router.post('/', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const sentViaSmtp = await sendWithSmtp({ name, email, message });
    if (sentViaSmtp) {
      return res.json({ ok: true, method: 'smtp' });
    }

    await sendWithFormSubmit({ name, email, message });
    return res.json({ ok: true, method: 'formsubmit' });
  } catch (error) {
    console.error('[server] contact send failed:', error);
    return res.status(500).json({
      error: 'Unable to send your message right now. Please try again later.',
    });
  }
});

module.exports = router;
