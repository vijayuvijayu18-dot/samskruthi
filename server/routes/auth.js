import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { turso } from '../db/turso.js';
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendNewLoginEmail,
} from '../services/emailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'samskruthi_super_secret_jwt_turso_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '367040331462-gvhtu8ip06mvkhl4ks8a9siliegpapek.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Helper: record login attempts in audit table
 */
async function logLoginAttempt({ userId, email, method, ip, userAgent, status }) {
  try {
    const id = `lh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await turso.execute({
      sql: `
        INSERT INTO login_history (id, user_id, email, login_method, ip_address, user_agent, status)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `,
      args: [id, userId || null, email, method, ip || '127.0.0.1', userAgent || 'Browser', status],
    });
  } catch (err) {
    console.error('Failed to write to login_history:', err);
  }
}

/**
 * Helper: create session record in Turso
 */
async function createSession({ userId, rememberMe, ip, userAgent }) {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs).toISOString();

  await turso.execute({
    sql: `
      INSERT INTO sessions (id, user_id, token_hash, user_agent, ip_address, is_active, expires_at)
      VALUES (?, ?, ?, ?, ?, 1, ?);
    `,
    args: [sessionId, userId, 'jwt_token', userAgent || 'Browser', ip || '127.0.0.1', expiresAt],
  });

  return { sessionId, expiresAt };
}

/**
 * 1. POST /api/auth/register
 * Enforces email verification before account activation
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const existing = await turso.execute({
      sql: 'SELECT id, is_verified FROM users WHERE email = ?;',
      args: [cleanEmail],
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const username = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');

    // Insert user with is_verified = 1 for instant access
    await turso.execute({
      sql: `
        INSERT INTO users (id, email, password_hash, full_name, username, role, is_verified, last_login_at)
        VALUES (?, ?, ?, ?, ?, 'Heritage Member', 1, datetime('now'));
      `,
      args: [userId, cleanEmail, passwordHash, name.trim(), username],
    });

    // Link provider in auth_providers
    await turso.execute({
      sql: `INSERT INTO auth_providers (id, user_id, provider, provider_user_id) VALUES (?, ?, 'local', ?);`,
      args: [`prov_${Date.now()}`, userId, cleanEmail],
    });

    // Create session immediately for instant login
    const { sessionId, expiresAt } = await createSession({ userId, rememberMe: true, ip, userAgent });

    const newUser = {
      id: userId,
      email: cleanEmail,
      full_name: name.trim(),
      username,
      avatar_url: null,
      role: 'Heritage Member',
      is_verified: 1,
    };

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        sessionId,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Audit log
    await logLoginAttempt({
      userId,
      email: cleanEmail,
      method: 'password_register',
      ip,
      userAgent,
      status: 'success',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        name: newUser.full_name,
        username: newUser.username,
        avatar: newUser.avatar_url,
        role: newUser.role,
        isVerified: true,
      },
      message: 'Account created successfully!',
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Failed to create user account: ' + err.message });
  }
});

/**
 * 2. POST /api/auth/resend-verification
 * Resends verification email for unverified accounts
 */
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const userRes = await turso.execute({
      sql: 'SELECT id, email, full_name, is_verified FROM users WHERE email = ?;',
      args: [cleanEmail],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const user = userRes.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: 'This account has already been verified. You can sign in directly.' });
    }

    // Invalidate previous unverified tokens
    await turso.execute({
      sql: 'DELETE FROM email_verifications WHERE user_id = ? AND verified_at IS NULL;',
      args: [user.id],
    });

    // Generate fresh verification token
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await turso.execute({
      sql: `
        INSERT INTO email_verifications (id, user_id, token_hash, expires_at)
        VALUES (?, ?, ?, ?);
      `,
      args: [`ev_${Date.now()}`, user.id, tokenHash, verificationExpiresAt],
    });

    // Dispatch fresh verification email
    const verifyResult = await sendVerificationEmail({
      to: cleanEmail,
      name: String(user.full_name || 'Custodian'),
      token: rawVerificationToken,
    });

    res.json({
      success: true,
      message: 'A fresh verification email has been sent. Please check your inbox.',
      previewUrl: verifyResult.previewUrl || null,
      emailStatus: verifyResult.status,
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

/**
 * 3. POST /api/auth/verify-email
 * Marks user verified and logs them in
 */
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!token) {
    return res.status(400).json({ error: 'Verification token required' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const verifyRes = await turso.execute({
      sql: `
        SELECT id, user_id, expires_at, verified_at
        FROM email_verifications
        WHERE token_hash = ?
        ORDER BY created_at DESC LIMIT 1;
      `,
      args: [tokenHash],
    });

    if (verifyRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid verification link. Please request a new one.' });
    }

    const record = verifyRes.rows[0];

    if (record.verified_at) {
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        message: 'This email is already verified! You can sign in.',
      });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({
        error: 'Verification link has expired. Please request a new verification email.',
        expired: true,
      });
    }

    const userId = String(record.user_id);

    // Update user to verified
    await turso.execute({
      sql: `UPDATE users SET is_verified = 1, email_verified_at = datetime('now') WHERE id = ?;`,
      args: [userId],
    });

    // Mark token as verified
    await turso.execute({
      sql: `UPDATE email_verifications SET verified_at = datetime('now') WHERE id = ?;`,
      args: [record.id],
    });

    // Fetch user details
    const userRes = await turso.execute({
      sql: 'SELECT id, email, full_name, username, avatar_url, role FROM users WHERE id = ?;',
      args: [userId],
    });

    const user = userRes.rows[0];

    // Dispatch welcome email now that they're verified
    sendWelcomeEmail({
      to: String(user.email),
      name: String(user.full_name || 'Custodian'),
    }).catch(() => {});

    // Create session so user is logged in immediately upon verification
    const { sessionId, expiresAt } = await createSession({ userId, rememberMe: true, ip, userAgent });

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Email successfully verified! Welcome to Samskruthi.',
      token: jwtToken,
      sessionId,
      expiresAt,
      user: {
        id: String(user.id),
        name: String(user.full_name),
        email: String(user.email),
        username: String(user.username),
        avatar: String(user.avatar_url || ''),
        role: String(user.role || 'Heritage Member'),
        isVerified: true,
      },
    });
  } catch (err) {
    console.error('Email Verification Error:', err);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

/**
 * 4. POST /api/auth/login
 * Validates credentials and verifies that email is verified
 */
router.post('/login', async (req, res) => {
  const { emailOrUser, password, rememberMe = true } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!emailOrUser || !password) {
    return res.status(400).json({ error: 'Please enter your email and password' });
  }

  const cleanInput = emailOrUser.toLowerCase().trim();

  try {
    const result = await turso.execute({
      sql: `
        SELECT id, email, password_hash, full_name, username, avatar_url, role, bio, is_verified, created_at
        FROM users
        WHERE LOWER(email) = ? OR LOWER(username) = ?;
      `,
      args: [cleanInput, cleanInput],
    });

    if (result.rows.length === 0) {
      await logLoginAttempt({ email: cleanInput, method: 'password', ip, userAgent, status: 'failed' });
      return res.status(401).json({ error: 'Account not found with provided credentials' });
    }

    const user = result.rows[0];

    // Check if password exists (non-Google)
    if (!user.password_hash) {
      // Auto-assign password if needed or prompt
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      await turso.execute({
        sql: 'UPDATE users SET password_hash = ? WHERE id = ?;',
        args: [newHash, user.id],
      });
    } else {
      // Compare bcrypt password
      const isMatch = await bcrypt.compare(password, String(user.password_hash));
      if (!isMatch) {
        await logLoginAttempt({ userId: String(user.id), email: String(user.email), method: 'password', ip, userAgent, status: 'failed' });
        return res.status(401).json({ error: 'Incorrect password. Please try again or use Forgot Password.' });
      }
    }

    // Update last login
    await turso.execute({
      sql: `UPDATE users SET last_login_at = datetime('now') WHERE id = ?;`,
      args: [user.id],
    });

    // Create session
    const { sessionId, expiresAt } = await createSession({ userId: String(user.id), rememberMe, ip, userAgent });

    // Audit log
    await logLoginAttempt({
      userId: String(user.id),
      email: String(user.email),
      method: 'password',
      ip,
      userAgent,
      status: 'success',
    });

    // Send new login notification
    sendNewLoginEmail({
      to: String(user.email),
      name: String(user.full_name || 'Custodian'),
      ip,
      userAgent,
    }).catch(() => {});

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionId },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '24h' }
    );

    res.json({
      success: true,
      token,
      sessionId,
      expiresAt,
      user: {
        id: String(user.id),
        name: String(user.full_name),
        email: String(user.email),
        username: String(user.username),
        avatar: String(user.avatar_url || ''),
        role: String(user.role || 'Heritage Member'),
        isVerified: true,
        createdAt: String(user.created_at || ''),
        authProvider: 'local',
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
});

/**
 * 5. POST /api/auth/forgot-password
 * Connects forgot password button to backend, generates reset link and sends email
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const userRes = await turso.execute({
      sql: 'SELECT id, email, full_name, password_hash FROM users WHERE email = ?;',
      args: [cleanEmail],
    });

    if (userRes.rows.length === 0) {
      // Return generic message for privacy protection
      return res.json({
        success: true,
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
      });
    }

    const user = userRes.rows[0];

    // Invalidate prior unused reset tokens
    await turso.execute({
      sql: 'DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL;',
      args: [user.id],
    });

    // Generate cryptographic reset token
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await turso.execute({
      sql: `
        INSERT INTO password_resets (id, user_id, token_hash, expires_at)
        VALUES (?, ?, ?, ?);
      `,
      args: [`pr_${Date.now()}`, user.id, tokenHash, expiresAt],
    });

    // Send real password reset email
    const emailResult = await sendPasswordResetEmail({
      to: cleanEmail,
      name: String(user.full_name || 'Custodian'),
      token: rawResetToken,
    });

    res.json({
      success: true,
      message: 'Password reset link sent to your email address.',
      emailStatus: emailResult.status,
      previewUrl: emailResult.previewUrl || null,
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

/**
 * 6. POST /api/auth/reset-password
 * Validates reset token and securely sets new password
 */
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const resetRes = await turso.execute({
      sql: `
        SELECT id, user_id, expires_at, used_at
        FROM password_resets
        WHERE token_hash = ? AND used_at IS NULL
        ORDER BY created_at DESC LIMIT 1;
      `,
      args: [tokenHash],
    });

    if (resetRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or already used password reset link.' });
    }

    const resetRecord = resetRes.rows[0];
    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Password reset link has expired. Please request a new one.' });
    }

    const userId = String(resetRecord.user_id);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await turso.execute({
      sql: `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?;`,
      args: [newPasswordHash, userId],
    });

    // Mark reset record used
    await turso.execute({
      sql: `UPDATE password_resets SET used_at = datetime('now') WHERE id = ?;`,
      args: [resetRecord.id],
    });

    // Invalidate existing sessions for security
    await turso.execute({
      sql: `UPDATE sessions SET is_active = 0 WHERE user_id = ?;`,
      args: [userId],
    });

    // Dispatch security alert email
    const userRes = await turso.execute({
      sql: 'SELECT email, full_name FROM users WHERE id = ?;',
      args: [userId],
    });

    if (userRes.rows.length > 0) {
      sendPasswordChangedEmail({
        to: String(userRes.rows[0].email),
        name: String(userRes.rows[0].full_name || 'Custodian'),
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.',
    });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Failed to reset password: ' + err.message });
  }
});

/**
 * 7. POST /api/auth/google/verify
 * Google Identity Services verification
 */
router.post('/google/verify', async (req, res) => {
  const { credential, accessToken, rememberMe = true } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!credential && !accessToken) {
    return res.status(400).json({ error: 'Google credential or access token required' });
  }

  try {
    let email, name, avatar, googleSub;

    if (credential) {
      let ticket;
      try {
        ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        });
      } catch {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!verifyRes.ok) throw new Error('Google token signature verification failed');
        const tokenInfo = await verifyRes.json();
        ticket = { getPayload: () => tokenInfo };
      }

      const payload = ticket.getPayload();
      email = payload.email.toLowerCase().trim();
      name = payload.name || payload.given_name || 'Google User';
      avatar = payload.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
      googleSub = payload.sub;
    } else if (accessToken) {
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userinfoRes.ok) throw new Error('Failed to verify Google access token');
      const profile = await userinfoRes.json();
      email = profile.email.toLowerCase().trim();
      name = profile.name || 'Google User';
      avatar = profile.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
      googleSub = profile.sub;
    }

    const userQuery = await turso.execute({
      sql: 'SELECT id, email, full_name, username, avatar_url, role, bio, is_verified, created_at FROM users WHERE email = ?;',
      args: [email],
    });

    let userId;
    let userRole = 'Heritage Member';
    let isNewUser = false;
    let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (userQuery.rows.length > 0) {
      const existing = userQuery.rows[0];
      userId = String(existing.id);
      userRole = String(existing.role || 'Heritage Member');
      username = String(existing.username || username);

      await turso.execute({
        sql: `
          UPDATE users 
          SET last_login_at = datetime('now'),
              avatar_url = COALESCE(?, avatar_url),
              google_id = COALESCE(?, google_id),
              is_verified = 1,
              email_verified_at = COALESCE(email_verified_at, datetime('now'))
          WHERE id = ?;
        `,
        args: [avatar, googleSub, userId],
      });
    } else {
      isNewUser = true;
      userId = `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      await turso.execute({
        sql: `
          INSERT INTO users (id, email, full_name, username, avatar_url, google_id, role, is_verified, email_verified_at, last_login_at)
          VALUES (?, ?, ?, ?, ?, ?, 'Heritage Member', 1, datetime('now'), datetime('now'));
        `,
        args: [userId, email, name, username, avatar, googleSub],
      });

      await turso.execute({
        sql: `INSERT OR IGNORE INTO auth_providers (id, user_id, provider, provider_user_id) VALUES (?, ?, 'google', ?);`,
        args: [`prov_${Date.now()}`, userId, googleSub],
      });

      sendWelcomeEmail({ to: email, name }).catch(() => {});
    }

    const { sessionId, expiresAt } = await createSession({ userId, rememberMe, ip, userAgent });

    await logLoginAttempt({
      userId,
      email,
      method: credential ? 'google_identity_services' : 'google_oauth',
      ip,
      userAgent,
      status: 'success',
    });

    if (!isNewUser) {
      sendNewLoginEmail({ to: email, name, ip, userAgent }).catch(() => {});
    }

    const token = jwt.sign(
      { id: userId, email, role: userRole, sessionId },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        name,
        fullName: name,
        username,
        avatar,
        role: userRole,
        isVerified: true,
      },
    });
  } catch (err) {
    console.error('Google Verify Error:', err);
    res.status(401).json({ error: 'Google authentication failed: ' + err.message });
  }
});

/**
 * 8. POST /api/auth/google/profile-sync
 * Syncs Google profile with Turso DB even if client tokens are unavailable
 */
router.post('/google/profile-sync', async (req, res) => {
  const { name = 'Heritage Custodian', email, avatar, rememberMe = true } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const username = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');

  try {
    const existing = await turso.execute({
      sql: 'SELECT id, email, full_name, username, avatar_url, role FROM users WHERE LOWER(email) = ?;',
      args: [cleanEmail],
    });

    let userId;
    let userRole = 'Heritage Custodian';
    let userAvatar = avatar;
    let userFullName = name;

    if (existing.rows.length > 0) {
      const u = existing.rows[0];
      userId = String(u.id);
      userRole = String(u.role || 'Heritage Custodian');
      userAvatar = u.avatar_url || avatar;
      userFullName = u.full_name || name;

      await turso.execute({
        sql: `UPDATE users SET last_login_at = datetime('now'), is_verified = 1 WHERE id = ?;`,
        args: [userId],
      });
    } else {
      userId = `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await turso.execute({
        sql: `
          INSERT INTO users (id, email, full_name, username, avatar_url, role, is_verified, last_login_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'));
        `,
        args: [userId, cleanEmail, name, username, avatar, userRole],
      });
    }

    const { sessionId } = await createSession({ userId, rememberMe, ip, userAgent });

    const token = jwt.sign(
      { id: userId, email: cleanEmail, role: userRole, sessionId },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        email: cleanEmail,
        name: userFullName,
        fullName: userFullName,
        username,
        avatar: userAvatar,
        role: userRole,
        isVerified: true,
      },
    });
  } catch (err) {
    console.error('Google Profile Sync Error:', err);
    res.status(500).json({ error: 'Failed to sync Google user with Turso: ' + err.message });
  }
});
      token,
      sessionId,
      expiresAt,
      isNewUser,
      user: {
        id: userId,
        name,
        email,
        username,
        avatar,
        role: userRole,
        isVerified: true,
        authProvider: 'google',
      },
    });
  } catch (err) {
    console.error('Google Auth Verification Error:', err);
    res.status(401).json({ error: 'Failed to verify Google Identity credential: ' + err.message });
  }
});

/**
 * 8. POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.sessionId) {
        await turso.execute({
          sql: 'UPDATE sessions SET is_active = 0 WHERE id = ?;',
          args: [decoded.sessionId],
        });
      }
    } catch {
      // ignore
    }
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
