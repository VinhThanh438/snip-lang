import mongoose, { Document, Schema } from 'mongoose';

interface IGrammarHighlight {
  text: string;
  role: string;
  explanation: string;
}

interface IVocabItem {
  word: string;
  meaning: string;
  pronunciation: string;
  partOfSpeech: string;
  examples: string[];
  synonyms: string[];
  level: string;
  vocabId: mongoose.Types.ObjectId | null;
}

export interface ISentenceAnalysis extends Document {
  sentenceId: mongoose.Types.ObjectId;
  textHash: string;
  translation: string;
  grammar: {
    structure: string;
    tense: string;
    explanation: string;
    highlights: IGrammarHighlight[];
  };
  vocabulary: IVocabItem[];
  context: string;
  similarSentences: string[];
  aiModel: string;
  processingTimeMs: number;
  tokensUsed: number;
  createdAt: Date;
}

const SentenceAnalysisSchema = new Schema<ISentenceAnalysis>(
  {
    sentenceId: { type: Schema.Types.ObjectId, ref: 'Sentence', required: true, unique: true },
    textHash: { type: String, required: true },

    translation: { type: String, default: '' },

    grammar: {
      structure: { type: String, default: '' },
      tense: { type: String, default: '' },
      explanation: { type: String, default: '' },
      highlights: [
        {
          text: String,
          role: String,
          explanation: String,
          _id: false,
        },
      ],
    },

    vocabulary: [
      {
        word: { type: String, required: true },
        meaning: { type: String, default: '' },
        pronunciation: { type: String, default: '' },
        partOfSpeech: { type: String, default: '' },
        examples: [String],
        synonyms: [String],
        level: { type: String, default: '' },
        vocabId: { type: Schema.Types.ObjectId, ref: 'Vocabulary', default: null },
        _id: false,
      },
    ],

    context: { type: String, default: '' },
    similarSentences: [String],

    aiModel: { type: String, default: 'gemini-2.0-flash' },
    processingTimeMs: { type: Number, default: 0 },
    tokensUsed: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

SentenceAnalysisSchema.index({ textHash: 1 });

export const SentenceAnalysisModel = mongoose.model<ISentenceAnalysis>(
  'SentenceAnalysis',
  SentenceAnalysisSchema
);
