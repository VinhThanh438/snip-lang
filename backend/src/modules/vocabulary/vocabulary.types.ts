import { z } from 'zod';

export const ReviewVocabSchema = z.object({
  quality: z.number().int().min(0).max(5),
});

export const MarkKnownSchema = z.object({
  isKnown: z.boolean(),
});

export type ReviewVocabDto = z.infer<typeof ReviewVocabSchema>;
export type MarkKnownDto = z.infer<typeof MarkKnownSchema>;

export const SaveVocabSchema = z.object({
  word: z.string().trim().min(1),
  pronunciation: z.string().optional(),
  partOfSpeech: z.string().optional(),
  meaning: z.string().optional(),
  examples: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
});

export type SaveVocabDto = z.infer<typeof SaveVocabSchema>;

export const CheckSavedSchema = z.object({
  words: z.array(z.string().trim().min(1)),
});

export const UnsaveVocabSchema = z.object({
  word: z.string().trim().min(1),
});

export type CheckSavedDto = z.infer<typeof CheckSavedSchema>;
export type UnsaveVocabDto = z.infer<typeof UnsaveVocabSchema>;
