import { Response } from 'express';
import { AuthRequest, asyncHandler } from '../../middleware/auth.middleware';
import { ReviewVocabSchema, MarkKnownSchema } from './vocabulary.types';
import * as VocabService from './vocabulary.service';

export const getDue = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query['limit'] as string) || 20;
  const data = await VocabService.getDueVocabulary(req.user!.userId, limit);
  res.json({ success: true, data });
});

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query['page'] as string) || 1;
  const limit = parseInt(req.query['limit'] as string) || 30;
  const data = await VocabService.getAllUserVocabulary(req.user!.userId, page, limit);
  res.json({ success: true, data });
});

export const review = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;
  const dto = ReviewVocabSchema.parse(req.body);
  const data = await VocabService.reviewVocabulary(req.user!.userId, id, dto);
  res.json({ success: true, data });
});

export const markKnown = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;
  const dto = MarkKnownSchema.parse(req.body);
  const data = await VocabService.markVocabularyKnown(req.user!.userId, id, dto);
  res.json({ success: true, data });
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await VocabService.getVocabularyStats(req.user!.userId);
  res.json({ success: true, data });
});
