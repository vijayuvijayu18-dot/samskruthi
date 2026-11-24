import { turso } from '../db/turso.js';

export async function createNotification({
  recipientUserId,
  actorUserId,
  type,
  title,
  message,
  data = {},
}) {
  if (!recipientUserId || recipientUserId === actorUserId) {
    // Don't notify users of their own actions
    return null;
  }

  const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    await turso.execute({
      sql: `
        INSERT INTO notifications (id, user_id, type, title, message, data, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP);
      `,
      args: [
        notificationId,
        recipientUserId,
        type,
        title,
        message,
        JSON.stringify({ ...data, actorUserId }),
      ],
    });
    return notificationId;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}
