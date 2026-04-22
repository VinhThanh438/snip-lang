import { Router } from 'express';
import * as SentencesController from './sentences.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', SentencesController.saveSentence);
router.get('/', SentencesController.getSentences);
router.get('/:id', SentencesController.getSentenceById);
router.delete('/:id', SentencesController.deleteSentence);
router.patch('/:id/favorite', SentencesController.toggleFavorite);

export default router;
