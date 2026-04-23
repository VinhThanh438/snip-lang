import mongoose from 'mongoose';
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

export async function getDueVocabulary(userId: string, limit = 20, topic?: string) {
  const query: any = {
    userId,
    isKnown: false,
    nextReviewAt: { $lte: new Date() },
  };

  if (topic) {
    query.topics = topic;
  }

  const due = await UserVocabularyProgressModel.find(query)
    .populate('vocabId')
    .sort({ nextReviewAt: 1 })
    .limit(limit)
    .lean();

  const items = [];
  for (const item of due as any[]) {
    let vocabInfo = item.vocabId;
    
    // Nếu populate thất bại (hiếm khi xảy ra nhưng phòng hờ), thử tìm theo word
    if (!vocabInfo) {
      vocabInfo = await VocabularyModel.findOne({ word: item.word }).lean();
    }

    items.push({
      _id: item._id,
      word: item.word,
      pronunciation: vocabInfo?.pronunciation || '',
      meaning: vocabInfo?.meanings?.find((m: any) => m.language === 'vi')?.meaning || 
               vocabInfo?.meanings?.[0]?.meaning || '',
      examples: vocabInfo?.examples || [],
      status: item.status,
      nextReviewAt: item.nextReviewAt
    });
  }

  return items;
}

export async function getAllUserVocabulary(userId: string, page = 1, limit = 30, topic?: string) {
  const skip = (page - 1) * limit;
  const query: any = { userId };
  
  if (topic) {
    query.topics = topic;
  }

  const [items, total] = await Promise.all([
    UserVocabularyProgressModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    UserVocabularyProgressModel.countDocuments(query),
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

export async function getUserTopicsWithStats(userId: string) {
  const stats = await UserVocabularyProgressModel.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$topics' },
    {
      $group: {
        _id: '$topics',
        totalCount: { $sum: 1 },
        dueCount: {
          $sum: {
            $cond: [
              { $and: [
                { $lte: ['$nextReviewAt', new Date()] },
                { $eq: ['$isKnown', false] }
              ]},
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return stats.map(s => ({
    topic: s._id,
    totalCount: s.totalCount,
    dueCount: s.dueCount
  }));
}

export async function getUserTopics(userId: string) {
  const topics = await UserVocabularyProgressModel.distinct('topics', { userId });
  return topics.filter(Boolean);
}

export async function saveVocabulary(userId: string, dto: import('./vocabulary.types').SaveVocabDto) {
  const { word, pronunciation, partOfSpeech, meaning, examples, topics } = dto;
  const lowercaseWord = word.toLowerCase();
  const pos = partOfSpeech || 'unknown';

  let vocab = await VocabularyModel.findOne({ word: lowercaseWord, partOfSpeech: pos });

  if (!vocab) {
    vocab = await VocabularyModel.create({
      word: lowercaseWord,
      pronunciation: pronunciation || '',
      partOfSpeech: pos,
      meanings: meaning ? [{ language: 'vi', meaning }] : [],
      examples: examples || [],
    });
  } else {
    // Optionally update missing fields
    if (meaning && !vocab.meanings.some((m) => m.language === 'vi')) {
      vocab.meanings.push({ language: 'vi', meaning });
      await vocab.save();
    }
  }

  const existingProgress = await UserVocabularyProgressModel.findOne({ userId, vocabId: vocab._id });

  if (existingProgress) {
    existingProgress.topics = topics || [];
    await existingProgress.save();
    return existingProgress;
  }

  const newProgress = await UserVocabularyProgressModel.create({
    userId,
    vocabId: vocab._id,
    word: vocab.word,
    topics: topics || [],
  });

  return newProgress;
}

export async function checkSavedVocabulary(userId: string, words: string[]) {
  const lowercaseWords = words.map((w) => w.toLowerCase());
  const savedProgresses = await UserVocabularyProgressModel.find({
    userId,
    word: { $in: lowercaseWords },
  })
    .select('word topics')
    .lean();

  return savedProgresses; // Returns array of { word, topics }
}

export async function unsaveVocabulary(userId: string, word: string) {
  const lowercaseWord = word.toLowerCase();
  await UserVocabularyProgressModel.findOneAndDelete({
    userId,
    word: lowercaseWord,
  });
}
