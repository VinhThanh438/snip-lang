import mongoose, { Document, Schema } from 'mongoose';

export interface IVocabulary extends Document {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meanings: Array<{ language: string; meaning: string }>;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  level: string;
  topics: string[];
  frequency: number;
  createdAt: Date;
  updatedAt: Date;
}

const VocabularySchema = new Schema<IVocabulary>(
  {
    word: { type: String, required: true, lowercase: true, trim: true },
    pronunciation: { type: String, default: '' },
    partOfSpeech: { type: String, required: true },
    meanings: [
      {
        language: { type: String, required: true },
        meaning: { type: String, required: true },
        _id: false,
      },
    ],
    examples: [String],
    synonyms: [String],
    antonyms: [String],
    level: { type: String, default: '' },
    topics: [String],
    frequency: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

VocabularySchema.index({ word: 1, partOfSpeech: 1 }, { unique: true });
VocabularySchema.index({ word: 'text' });
VocabularySchema.index({ level: 1 });
VocabularySchema.index({ topics: 1 });

export const VocabularyModel = mongoose.model<IVocabulary>('Vocabulary', VocabularySchema);
