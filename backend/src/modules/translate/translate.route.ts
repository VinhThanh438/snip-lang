import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/auth.middleware';
import { quickTranslate } from './translate.service';

const router = Router();

const TranslateSchema = z.object({
  text: z.string().min(1).max(2000),
});

router.post('/', asyncHandler(async (req, res) => {
  const { text } = TranslateSchema.parse(req.body);
  const translation = await quickTranslate(text);
  res.json({ success: true, data: { translation } });
}));

export default router;
