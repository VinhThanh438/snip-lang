import { Response } from 'express';
import { AuthRequest, asyncHandler } from '../../middleware/auth.middleware';
import { SaveSentenceSchema, GetSentencesQuerySchema } from './sentences.types';
import * as SentencesService from './sentences.service';

export const saveSentence = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dto = SaveSentenceSchema.parse(req.body);
  const sentence = await SentencesService.saveSentence(req.user!.userId, dto);
  res.status(201).json({ success: true, data: sentence });
});

export const getSentences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = GetSentencesQuerySchema.parse(req.query);
  const result = await SentencesService.getSentences(req.user!.userId, query);
  res.json({ success: true, data: result });
});

export const getSentenceById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;
  const result = await SentencesService.getSentenceById(req.user!.userId, id);
  res.json({ success: true, data: result });
});

export const deleteSentence = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;
  await SentencesService.deleteSentence(req.user!.userId, id);
  res.json({ success: true, message: 'Đã xoá câu' });
});

export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;
  const updated = await SentencesService.toggleFavorite(req.user!.userId, id);
  res.json({ success: true, data: updated });
});
