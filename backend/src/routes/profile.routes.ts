import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/me', authenticate, profileController.getCurrentProfile);
router.put('/me', authenticate, profileController.updateProfile);
router.get('/:id', profileController.getProfileById);

export default router;
