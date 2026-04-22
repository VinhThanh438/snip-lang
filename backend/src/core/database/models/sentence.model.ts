import mongoose, { Document, Schema } from 'mongoose';

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ISentence extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  textHash: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDomain: string;
  analysisStatus: AnalysisStatus;
  analysisId: mongoose.Types.ObjectId | null;
  isArchived: boolean;
  isFavorited: boolean;
  tags: string[];
  savedAt: Date;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SentenceSchema = new Schema<ISentence>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 5000 },
    textHash: { type: String, required: true },
    sourceUrl: { type: String, default: '' },
    sourceTitle: { type: String, default: '' },
    sourceDomain: { type: String, default: '' },
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    analysisId: { type: Schema.Types.ObjectId, ref: 'SentenceAnalysis', default: null },
    isArchived: { type: Boolean, default: false },
    isFavorited: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    savedAt: { type: Date, default: Date.now },
    lastReviewedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

SentenceSchema.index({ userId: 1, createdAt: -1 });
SentenceSchema.index({ userId: 1, analysisStatus: 1 });
SentenceSchema.index({ userId: 1, isArchived: 1, createdAt: -1 });
SentenceSchema.index({ userId: 1, sourceDomain: 1 });
SentenceSchema.index({ textHash: 1 });
SentenceSchema.index({ text: 'text' });

export const SentenceModel = mongoose.model<ISentence>('Sentence', SentenceSchema);
