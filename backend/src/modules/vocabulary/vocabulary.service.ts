import { UserVocabularyProgressModel } from '../../core/database/models/user-vocabulary-progress.model';
import { VocabularyModel } from '../../core/database/models/vocabulary.model';
import { Errors } from '../../core/errors';
import { ReviewVocabDto, MarkKnownDto } from './vocabulary.types';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sm2(repetitionCount: number, easeFactor: number, intervalDays: number, quality: number) {
  const ef = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  if (quality < 3) {
    return { repetitionCount: 0, easeFactor: ef, intervalDays: 1, nextReviewAt: addDays(new Date(), 1) };
  }
  const n = repetitionCount + 1;
  const interval = n === 1 ? 1 : n === 2 ? 6 : Math.round(intervalDays * ef);
  return { repetitionCount: n, easeFactor: ef, intervalDays: interval, nextReviewAt: addDays(new Date(), interval) };
}

export async function getDueVocabulary(userId: string, limit = 20) {
  const due = await UserVocabularyProgressModel.find({
    userId,
    isKnown: false,
    nextReviewAt: { $lte: new Date() },
  })
    .sort({ nextReviewAt: 1 })
    .limit(limit)
    .lean();

  return due;
}

export async function getAllUserVocabulary(userId: string, page = 1, limit = 30) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    UserVocabularyProgressModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    UserVocabularyProgressModel.countDocuments({ userId }),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function reviewVocabulary(userId: string, progressId: string, dto: ReviewVocabDto) {
  const progress = await UserVocabularyProgressModel.findOne({ _id: progressId, userId });
  if (!progress) throw Errors.NotFound('Vocabulary progress');

  const { repetitionCount, easeFactor, intervalDays, nextReviewAt } = sm2(
    progress.repetitionCount,
    progress.easeFactor,
    progress.intervalDays,
    dto.quality
  );

  const status =
    repetitionCount >= 10 ? 'mastered' : repetitionCount >= 3 ? 'reviewing' : repetitionCount > 0 ? 'learning' : 'new';

  const reviewEntry = {
    reviewedAt: new Date(),
    quality: dto.quality,
    intervalBefore: progress.intervalDays,
  };

  const updated = await UserVocabularyProgressModel.findByIdAndUpdate(
    progressId,
    {
      repetitionCount,
      easeFactor,
      intervalDays,
      nextReviewAt,
      lastReviewedAt: new Date(),
      status,
      $push: {
        reviewHistory: {
          $each: [reviewEntry],
          $slice: -50,
        },
      },
    },
    { new: true }
  ).lean();

  return updated;
}

export async function markVocabularyKnown(userId: string, progressId: string, dto: MarkKnownDto) {
  const progress = await UserVocabularyProgressModel.findOne({ _id: progressId, userId });
  if (!progress) throw Errors.NotFound('Vocabulary progress');

  const updated = await UserVocabularyProgressModel.findByIdAndUpdate(
    progressId,
    {
      isKnown: dto.isKnown,
      status: dto.isKnown ? 'mastered' : 'learning',
    },
    { new: true }
  ).lean();

  return updated;
}

export async function getVocabularyStats(userId: string) {
  const stats = await UserVocabularyProgressModel.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const dueCount = await UserVocabularyProgressModel.countDocuments({
    userId,
    isKnown: false,
    nextReviewAt: { $lte: new Date() },
  });

  return { byStatus: stats, dueCount };
}
