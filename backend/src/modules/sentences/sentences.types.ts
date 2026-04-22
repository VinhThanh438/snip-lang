import { z } from 'zod';

export const SaveSentenceSchema = z.object({
  text: z.string().min(2, 'Câu quá ngắn').max(5000, 'Câu quá dài'),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  sourceTitle: z.string().max(200).optional().default(''),
});

export const GetSentencesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  domain: z.string().optional(),
  isFavorited: z.coerce.boolean().optional(),
});

export type SaveSentenceDto = z.infer<typeof SaveSentenceSchema>;
export type GetSentencesQuery = z.infer<typeof GetSentencesQuerySchema>;
