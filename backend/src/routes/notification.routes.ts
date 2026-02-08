import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Get user notifications
router.get('/', authenticate, notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', authenticate, notificationController.markAsRead);

// Mark all as read
router.put('/read-all', authenticate, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

export default router;
