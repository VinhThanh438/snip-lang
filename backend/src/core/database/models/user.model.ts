import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  displayName: string;
  avatarUrl: string;
  passwordHash: string | null;
  googleId: string | null;
  refreshTokenHash: string | null;
  settings: {
    autoTranslate: boolean;
    extensionEnabled: boolean;
    targetLanguage: string;
    nativeLanguage: string;
  };
  stats: {
    totalSentencesSaved: number;
    totalWordsLearned: number;
    currentStreak: number;
    lastStudiedAt: Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, sparse: true },
    refreshTokenHash: { type: String, default: null },

    settings: {
      autoTranslate: { type: Boolean, default: true },
      extensionEnabled: { type: Boolean, default: true },
      targetLanguage: { type: String, default: 'en' },
      nativeLanguage: { type: String, default: 'vi' },
    },

    stats: {
      totalSentencesSaved: { type: Number, default: 0 },
      totalWordsLearned: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      lastStudiedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.index({ googleId: 1 }, { sparse: true, unique: true });
UserSchema.index({ createdAt: -1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
