// Quick SMTP test — run with: node scripts/test-email.js
// Tests whether credentials work and actually delivers a real email

require('dotenv').config();
const nodemailer = require('nodemailer');

const {
  SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
  SMTP_FROM_NAME, SMTP_FROM_EMAIL,
} = process.env;

console.log('SMTP config:');
console.log(`  Host:   ${SMTP_HOST}:${SMTP_PORT}`);
console.log(`  Secure: ${SMTP_SECURE}`);
console.log(`  User:   ${SMTP_USER}`);
console.log(`  From:   ${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`);
console.log('');

const transporter = nodemailer.createTransport({
  host:   SMTP_HOST,
  port:   parseInt(SMTP_PORT, 10),
  secure: SMTP_SECURE === 'true',
  auth:   { user: SMTP_USER, pass: SMTP_PASS },
});

async function run() {
  // 1. Verify connection
  console.log('Step 1: Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('  ✅ SMTP connection verified successfully\n');
  } catch (err) {
    console.error('  ❌ SMTP connection FAILED:', err.message);
    console.log('\nCommon fixes:');
    console.log('  - Gmail: use an App Password (not your account password)');
    console.log('    Go to: https://myaccount.google.com/apppasswords');
    console.log('  - Ensure "2-Step Verification" is ON in your Google account');
    console.log('  - SMTP_PORT should be 587 with SMTP_SECURE=false');
    process.exit(1);
  }

  // 2. Send real test email
  const recipient = SMTP_USER; // send to yourself as test
  console.log(`Step 2: Sending test email to ${recipient}...`);
  try {
    const info = await transporter.sendMail({
      from:    `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
      to:      recipient,
      subject: '✅ InfluenceHub SMTP Test — Email delivery working',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#6366f1">InfluenceHub</h2>
          <p>This is a test email confirming your SMTP configuration is working correctly.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;margin:16px 0">
            <strong style="color:#16a34a">✅ Email delivery is working</strong><br/>
            <small>Sent at: ${new Date().toUTCString()}</small>
          </div>
          <p style="color:#6b7280;font-size:13px">
            Your OTP verification emails, password reset emails, and welcome emails will all be delivered successfully.
          </p>
        </div>
      `,
      text: `InfluenceHub SMTP Test\n\nEmail delivery is working!\nSent at: ${new Date().toUTCString()}`,
    });
    console.log('  ✅ Email sent successfully!');
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Check inbox: ${recipient}`);
  } catch (err) {
    console.error('  ❌ Send FAILED:', err.message);
    process.exit(1);
  }
}

run();
