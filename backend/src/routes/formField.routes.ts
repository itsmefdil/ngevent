import { Router } from 'express';
import * as formFieldController from '../controllers/formField.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/:eventId', formFieldController.getFormFieldsByEventId);
router.post('/', authenticate, authorize('organizer', 'admin'), formFieldController.createFormFields);
router.delete('/:eventId', authenticate, authorize('organizer', 'admin'), formFieldController.deleteFormFieldsByEventId);

export default router;
