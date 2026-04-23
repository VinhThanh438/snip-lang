import { Router } from 'express';
import * as VocabController from './vocabulary.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/due', VocabController.getDue);
router.get('/stats', VocabController.getStats);
router.get('/topics', VocabController.getTopics);
router.get('/topics/stats', VocabController.getTopicsStats);
router.get('/', VocabController.getAll);
router.post('/save', VocabController.save);
router.post('/check-saved', VocabController.checkSaved);
router.delete('/unsave', VocabController.unsave);
router.post('/:id/review', VocabController.review);
router.patch('/:id/known', VocabController.markKnown);

export default router;
