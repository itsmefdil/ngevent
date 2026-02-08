import { Response, NextFunction } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import db from '../db/connection';
import { notifications } from '../db/schema';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = '20', unreadOnly = 'false' } = req.query;

    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.id))
      .orderBy(desc(notifications.createdAt))
      .limit(parseInt(limit as string));

    if (unreadOnly === 'true') {
      query = db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, req.user!.id),
            eq(notifications.read, false)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(parseInt(limit as string));
    }

    const userNotifications = await query;

    res.json(userNotifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, req.user!.id)
        )
      )
      .returning();

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, req.user!.id),
          eq(notifications.read, false)
        )
      );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, req.user!.id)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new AppError('Notification not found', 404);
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type:
    | 'registration'
    | 'event_update'
    | 'reminder'
    | 'general'
    | 'payment'
    | 'info'
    | 'success'
    | 'warning'
    | 'error' = 'general'
) => {
  try {
    const normalizedType: 'registration' | 'event_update' | 'reminder' | 'general' | 'payment' =
      type === 'registration' ||
      type === 'event_update' ||
      type === 'reminder' ||
      type === 'general' ||
      type === 'payment'
        ? type
        : 'general';

    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        title,
        message,
        type: normalizedType,
      })
      .returning();

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};
