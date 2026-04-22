import { z } from 'zod';

export const ReviewVocabSchema = z.object({
  quality: z.number().int().min(0).max(5),
});

export const MarkKnownSchema = z.object({
  isKnown: z.boolean(),
});

export type ReviewVocabDto = z.infer<typeof ReviewVocabSchema>;
export type MarkKnownDto = z.infer<typeof MarkKnownSchema>;
