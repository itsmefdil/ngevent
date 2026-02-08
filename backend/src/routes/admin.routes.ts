import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Admin-only user management
router.get('/users/stats', authenticate, authorize('admin'), adminController.getUserStats);
router.get('/users', authenticate, authorize('admin'), adminController.listUsers);
router.patch('/users/:id', authenticate, authorize('admin'), adminController.updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), adminController.deleteUser);

export default router;
