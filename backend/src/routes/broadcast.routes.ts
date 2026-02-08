import { Router } from 'express';
import * as broadcastController from '../controllers/broadcast.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateSchema, schemas } from '../middlewares/validation';

const router = Router();

// Broadcast message to event participants
router.post(
  '/:eventId/broadcast',
  authenticate,
  authorize('organizer', 'admin'),
  validateSchema(schemas.broadcast),
  broadcastController.broadcastToParticipants
);

// Get broadcast history for an event
router.get(
  '/:eventId/broadcast-history',
  authenticate,
  authorize('organizer', 'admin'),
  broadcastController.getBroadcastHistory
);

export default router;
