import nodemailer from 'nodemailer';
import { turso } from '../db/turso.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EMAIL_FROM = process.env.EMAIL_FROM || '"Samskruthi Cultural Archive" <noreply@samskruthi.org>';

let cachedEtherealTransporter = null;

// Initialize or retrieve transporter
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  // 1. Live configured SMTP (Gmail, Brevo, SendGrid, Resend, etc.)
  if (host && user && pass) {
    const cleanPass = pass.replace(/\s+/g, '');
    const isGmail = host.includes('gmail') || user.includes('@gmail.com');
    const transporter = isGmail
      ? nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass: cleanPass },
        })
      : nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass: cleanPass },
        });

    return {
      transporter,
      isLiveSmtp: true,
      sender: user,
    };
  }

  // 2. Active Ethereal Transporter fallback for guaranteed testing
  if (!cachedEtherealTransporter) {
    try {
      console.log('⚡ Initializing Ethereal test mail exchanger...');
      const testAccount = await nodemailer.createTestAccount();
      cachedEtherealTransporter = {
        transporter: nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass },
        }),
        isLiveSmtp: false,
        isEthereal: true,
        sender: testAccount.user,
      };
      console.log('✅ Ethereal Mail Exchanger ready:', testAccount.user);
    } catch (etherealErr) {
      console.error('Failed to initialize Ethereal test account:', etherealErr.message);
    }
  }

  return cachedEtherealTransporter;
}

/**
 * Base email dispatcher
 */
export async function sendEmail({ to, subject, emailType, html, text }) {
  const outboxId = `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const transportConfig = await getTransporter();

  let deliveryStatus = 'pending';
  let deliveryError = null;
  let previewUrl = null;
  let messageId = null;

  if (transportConfig && transportConfig.transporter) {
    try {
      const fromAddress = transportConfig.isLiveSmtp
        ? EMAIL_FROM
        : `"Samskruthi Cultural Archive" <${transportConfig.sender}>`;

      const info = await transportConfig.transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text,
      });

      messageId = info.messageId;

      if (transportConfig.isEthereal) {
        previewUrl = nodemailer.getTestMessageUrl(info);
        deliveryStatus = 'delivered_test';
        console.log(`\n=======================================================`);
        console.log(`✉️  [EMAIL DISPATCHED VIA ETHEREAL SMTP] [${emailType}]`);
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   🌐 Live Web Inbox Preview: ${previewUrl}`);
        console.log(`=======================================================\n`);
      } else {
        deliveryStatus = 'delivered';
        console.log(`✉️  [LIVE EMAIL DELIVERED] [${emailType}] To: ${to} | Subject: ${subject}`);
      }
    } catch (err) {
      deliveryStatus = 'failed';
      deliveryError = err.message;
      console.error(`❌ [EMAIL DELIVERY FAILED] To: ${to}:`, err.message);
    }
  } else {
    deliveryStatus = 'logged';
    console.log(`📋 [EMAIL LOGGED] To: ${to} | Subject: ${subject}`);
  }

  // Audit record in Turso Cloud DB
  try {
    await turso.execute({
      sql: `
        INSERT INTO email_outbox (id, recipient, subject, email_type, body_html, body_text, status, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        outboxId,
        to || '',
        subject || '',
        emailType || 'notification',
        html || '',
        previewUrl ? `${text || ''}\n\n[Live Preview URL]: ${previewUrl}` : (text || ''),
        deliveryStatus || 'pending',
        deliveryError || null,
      ],
    });
  } catch (dbErr) {
    console.error('Failed to log email to Turso:', dbErr);
  }

  return {
    success: deliveryStatus === 'delivered' || deliveryStatus === 'delivered_test',
    isLiveSmtp: transportConfig?.isLiveSmtp || false,
    previewUrl,
    messageId,
    outboxId,
    status: deliveryStatus,
    error: deliveryError,
  };
}

/**
 * Common Heritage Email Template
 */
function wrapHeritageTemplate(title, preheader, contentHtml, recipientEmail = '') {
  const unsubUrl = `${FRONTEND_URL}/unsubscribe${recipientEmail ? `?email=${encodeURIComponent(recipientEmail)}` : ''}`;
  const privacyUrl = `${FRONTEND_URL}/privacy`;
  const termsUrl = `${FRONTEND_URL}/terms`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #16100c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3ede2; }
        .container { max-width: 580px; margin: 30px auto; background-color: #1e1610; border: 1px solid #c5a059; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #2a1e15 0%, #1a120c 100%); padding: 26px; text-align: center; border-bottom: 1px solid rgba(197, 160, 89, 0.3); }
        .brand-title { font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #d4af37; text-transform: uppercase; margin: 0; }
        .brand-sub { font-size: 11px; letter-spacing: 2px; color: #a89f91; text-transform: uppercase; margin-top: 5px; }
        .content { padding: 32px 28px; line-height: 1.6; color: #ede6d8; font-size: 15px; }
        .btn { display: inline-block; padding: 13px 30px; background-color: #c5a059; color: #16100c !important; font-weight: bold; text-decoration: none; border-radius: 8px; margin: 22px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .footer { padding: 22px; text-align: center; font-size: 11px; color: #a89f91; border-top: 1px solid rgba(197, 160, 89, 0.15); background-color: #16100c; line-height: 1.6; }
        .box { background: rgba(0,0,0,0.3); border: 1px solid rgba(197, 160, 89, 0.2); border-radius: 8px; padding: 16px; margin: 18px 0; }
        .link { color: #c5a059; word-break: break-all; }
        .footer-link { color: #c5a059; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand-title">Samskruthi</h1>
          <div class="brand-sub">Digital Cultural Archive of India</div>
        </div>
        <div class="content">
          ${contentHtml}
        </div>
        <div class="footer">
          <div>© ${new Date().getFullYear()} Samskruthi Cultural Heritage Foundation • Bengaluru, Karnataka, India</div>
          <div style="margin-top: 6px; font-size: 10px; color: #8c7b6d;">
            You received this communication regarding your registered custodian account or subscription.
          </div>
          <div style="margin-top: 8px;">
            <a href="${unsubUrl}" class="footer-link">Unsubscribe</a> • 
            <a href="${privacyUrl}" class="footer-link">Privacy Policy</a> • 
            <a href="${termsUrl}" class="footer-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 1. Welcome Email
 */
export async function sendWelcomeEmail({ to, name }) {
  const subject = 'Welcome to Samskruthi — India Digital Cultural Sanctuary';
  const html = wrapHeritageTemplate(
    subject,
    'Your custodian journey begins',
    `
      <h2 style="color: #d4af37; margin-top: 0;">Welcome, ${name}!</h2>
      <p>Your custodian account has been created in the Samskruthi Digital Cultural Archive.</p>
      <p>As a guardian of India's living cultural heritage, you can discover preserved monuments, share indigenous stories, participate in community discussions, and safeguard living traditions.</p>
      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/explore" class="btn">Explore Living Heritage</a>
      </div>
      <p style="font-size: 13px; color: #a39482;">If you have any questions, our cultural preservation team is here to support you.</p>
    `,
    to
  );

  return sendEmail({
    to,
    subject,
    emailType: 'welcome',
    html,
    text: `Welcome to Samskruthi, ${name}! Your custodian account has been created. Visit ${FRONTEND_URL}/explore to begin.`,
  });
}

/**
 * 2. Email Verification Message
 */
export async function sendVerificationEmail({ to, name, token }) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  const subject = 'Verify your Samskruthi Cultural Custodian Email';
  const html = wrapHeritageTemplate(
    subject,
    'Please verify your email address',
    `
      <h2 style="color: #d4af37; margin-top: 0;">Verify Your Email Address</h2>
      <p>Greetings ${name},</p>
      <p>Thank you for registering with Samskruthi. Please confirm your email address to activate your account and access all cultural custodian privileges.</p>
      <div style="text-align: center;">
        <a href="${verifyUrl}" class="btn">Confirm Email Address</a>
      </div>
      <p style="font-size: 12px; color: #8c7b6d;">Or open this link directly in your browser:<br/><a href="${verifyUrl}" class="link">${verifyUrl}</a></p>
      <div class="box">
        <p style="margin: 0; font-size: 12px; color: #cf8a4f;">⏳ This verification link is valid for 24 hours. If you did not create this account, no action is required.</p>
      </div>
    `,
    to
  );

  return sendEmail({
    to,
    subject,
    emailType: 'verification',
    html,
    text: `Please verify your email address for Samskruthi: ${verifyUrl} (Valid for 24 hours)`,
  });
}

/**
 * 3. Password Reset Email
 */
export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const subject = 'Reset your Samskruthi Account Password';
  const html = wrapHeritageTemplate(
    subject,
    'Password Reset Request',
    `
      <h2 style="color: #d4af37; margin-top: 0;">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your Samskruthi account. Click the button below to choose a new secure password.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #8c7b6d;">Direct reset link:<br/><a href="${resetUrl}" class="link">${resetUrl}</a></p>
      <div class="box">
        <p style="margin: 0; font-size: 12px; color: #cf8a4f;">⚠️ This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
    to
  );

  return sendEmail({
    to,
    subject,
    emailType: 'password_reset',
    html,
    text: `Reset your password for Samskruthi: ${resetUrl} (Valid for 1 hour)`,
  });
}

/**
 * 4. Password Changed Notification
 */
export async function sendPasswordChangedEmail({ to, name }) {
  const subject = 'Security Alert: Your Samskruthi Password Was Changed';
  const html = wrapHeritageTemplate(
    subject,
    'Your password was recently modified',
    `
      <h2 style="color: #d4af37; margin-top: 0;">Password Successfully Changed</h2>
      <p>Hello ${name},</p>
      <p>This is a confirmation that the password for your Samskruthi custodian account was recently updated on ${new Date().toUTCString()}.</p>
      <div class="box">
        <p style="margin: 0; font-size: 13px; color: #cf8a4f;">If you did not make this change, please immediately reset your password or contact security support.</p>
      </div>
    `,
    to
  );

  return sendEmail({
    to,
    subject,
    emailType: 'password_changed',
    html,
    text: `Your Samskruthi password was successfully updated on ${new Date().toUTCString()}. If this was not you, please reset your password immediately.`,
  });
}

/**
 * 5. New Login Notification
 */
export async function sendNewLoginEmail({ to, name, ip, userAgent }) {
  const subject = 'New Login to your Samskruthi Account';
  const html = wrapHeritageTemplate(
    subject,
    'New sign-in detected',
    `
      <h2 style="color: #d4af37; margin-top: 0;">New Sign-In Detected</h2>
      <p>Hello ${name},</p>
      <p>A new sign-in was recorded for your account:</p>
      <div class="box">
        <p style="margin: 4px 0; font-size: 13px;"><strong>Time:</strong> ${new Date().toUTCString()}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>IP Address:</strong> ${ip || 'Local / Private'}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Device / Browser:</strong> ${userAgent || 'Web Browser'}</p>
      </div>
      <p style="font-size: 12px; color: #8c7b6d;">If this was you, no action is required.</p>
    `,
    to
  );

  return sendEmail({
    to,
    subject,
    emailType: 'new_login',
    html,
    text: `New login to your Samskruthi account from IP: ${ip} at ${new Date().toUTCString()}.`,
  });
}

/**
 * 6. Account Deletion Confirmation
 */
export async function sendAccountDeletedEmail({ to, name }) {
  const subject = 'Account Deletion Confirmation — Samskruthi';
  const html = wrapHeritageTemplate(
    subject,
    'Your account has been deleted',
    `
      <h2 style="color: #d4af37; margin-top: 0;">Account Deletion Complete</h2>
      <p>Hello ${name},</p>
      <p>Your Samskruthi account, credentials, and associated personal session records have been permanently removed from our active database.</p>
      <p>We thank you for your custodianship and hope to welcome you back to India's digital heritage sanctuary in the future.</p>
    `,
    to
  );

  return sendEmail({
    to,
    subject,
    emailType: 'account_deletion',
    html,
    text: `Your Samskruthi account has been permanently deleted.`,
  });
}
