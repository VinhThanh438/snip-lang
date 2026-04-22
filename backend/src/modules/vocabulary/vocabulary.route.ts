import { Router } from 'express';
import * as VocabController from './vocabulary.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/due', VocabController.getDue);
router.get('/stats', VocabController.getStats);
router.get('/', VocabController.getAll);
router.post('/:id/review', VocabController.review);
router.patch('/:id/known', VocabController.markKnown);

export default router;
