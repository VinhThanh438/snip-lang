import mongoose, { Document, Schema } from 'mongoose';

export type LearningStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

interface IReviewEntry {
  reviewedAt: Date;
  quality: number;
  intervalBefore: number;
}

export interface IUserVocabularyProgress extends Document {
  userId: mongoose.Types.ObjectId;
  vocabId: mongoose.Types.ObjectId;
  word: string;
  status: LearningStatus;
  isKnown: boolean;
  repetitionCount: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: Date;
  lastReviewedAt: Date | null;
  reviewHistory: IReviewEntry[];
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserVocabularyProgressSchema = new Schema<IUserVocabularyProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vocabId: { type: Schema.Types.ObjectId, ref: 'Vocabulary', required: true },
    word: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'learning', 'reviewing', 'mastered'],
      default: 'new',
    },
    isKnown: { type: Boolean, default: false },
    repetitionCount: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    intervalDays: { type: Number, default: 1 },
    nextReviewAt: { type: Date, default: Date.now },
    lastReviewedAt: { type: Date, default: null },
    reviewHistory: {
      type: [
        {
          reviewedAt: { type: Date, required: true },
          quality: { type: Number, min: 0, max: 5 },
          intervalBefore: Number,
          _id: false,
        },
      ],
      default: [],
    },
    topics: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserVocabularyProgressSchema.index({ userId: 1, vocabId: 1 }, { unique: true });
UserVocabularyProgressSchema.index({ userId: 1, nextReviewAt: 1 });
UserVocabularyProgressSchema.index({ userId: 1, status: 1 });
UserVocabularyProgressSchema.index({ userId: 1, isKnown: 1 });

export const UserVocabularyProgressModel = mongoose.model<IUserVocabularyProgress>(
  'UserVocabularyProgress',
  UserVocabularyProgressSchema
);
