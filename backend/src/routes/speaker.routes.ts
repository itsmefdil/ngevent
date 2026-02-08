import { Router } from 'express';
import * as speakerController from '../controllers/speaker.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/:eventId', speakerController.getSpeakersByEventId);
router.post('/', authenticate, authorize('organizer', 'admin'), speakerController.createSpeakers);
router.delete('/:eventId', authenticate, authorize('organizer', 'admin'), speakerController.deleteSpeakersByEventId);

export default router;
