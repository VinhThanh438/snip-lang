# 🗄️ SNIP-LANG — Thiết Kế MongoDB Schema

## Tổng Quan

MongoDB được chọn vì cấu trúc dữ liệu phân tích AI linh hoạt (mỗi câu có vocabulary array, grammar object khác nhau). Tài liệu này mô tả chi tiết từng collection, các field, index và mối quan hệ.

---

## 📊 Sơ Đồ Quan Hệ Giữa Các Collections

```
Users
  │
  ├──── (1:N) ──── Sentences
  │                    │
  │                    └──── (1:1) ──── SentenceAnalysis
  │                                          │
  │                                          └── references ──── Vocabulary
  │
  └──── (1:N) ──── UserVocabularyProgress ──── references ──── Vocabulary
```

**Mối quan hệ:**
- 1 User có nhiều Sentences (lưu từ extension)
- 1 Sentence có tối đa 1 SentenceAnalysis (kết quả phân tích AI)
- SentenceAnalysis chứa danh sách từ vựng, mỗi từ reference tới Vocabulary collection
- UserVocabularyProgress theo dõi tiến độ học từ của mỗi user

---

## 1. Collection: `users`

Lưu thông tin tài khoản người dùng.

```typescript
{
  _id: ObjectId,                    // Primary key (MongoDB auto)

  // Thông tin cơ bản
  email: string,                    // Email đăng nhập, unique
  displayName: string,              // Tên hiển thị
  avatarUrl: string,                // URL ảnh đại diện

  // Auth
  passwordHash: string | null,      // null nếu đăng nhập bằng Google
  googleId: string | null,          // Google OAuth ID, null nếu dùng email
  refreshTokenHash: string | null,  // Hash của refresh token hiện tại

  // Cài đặt extension
  settings: {
    autoTranslate: boolean,         // Tự động dịch khi bôi đen
    extensionEnabled: boolean,      // Bật/tắt extension
    targetLanguage: string,         // Ngôn ngữ học (mặc định "en")
    nativeLanguage: string,         // Ngôn ngữ mẹ đẻ (mặc định "vi")
  },

  // Thống kê học tập
  stats: {
    totalSentencesSaved: number,    // Tổng số câu đã lưu
    totalWordsLearned: number,      // Tổng số từ đã học
    currentStreak: number,          // Chuỗi ngày học liên tiếp
    lastStudiedAt: Date | null,     // Lần học gần nhất
  },

  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
// Unique indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true })

// Lookup index
db.users.createIndex({ createdAt: -1 })
```

**Lý do thiết kế:**
- `settings` lồng vào user document vì luôn được đọc cùng nhau → không cần join
- `stats` denormalized để dashboard load nhanh, sync async khi có thay đổi
- `passwordHash` và `googleId` đều nullable để hỗ trợ cả 2 phương thức auth

---

## 2. Collection: `sentences`

Lưu các câu mà user đã highlight và save từ extension.

```typescript
{
  _id: ObjectId,

  // Ownership
  userId: ObjectId,                 // Reference tới users._id

  // Nội dung câu
  text: string,                     // Câu gốc đã lưu
  textHash: string,                 // MD5/SHA256 hash của text (lowercase, trimmed)
  sourceUrl: string,                // URL trang web nơi lưu câu
  sourceTitle: string,              // Tiêu đề trang (nếu có)
  sourceDomain: string,             // Domain để group/filter (vd: "bbc.com")

  // Trạng thái phân tích
  analysisStatus: "pending" | "processing" | "completed" | "failed",
  analysisId: ObjectId | null,      // Reference tới sentence_analyses._id

  // Metadata học tập
  isArchived: boolean,              // User đã archive/xóa mềm
  isFavorited: boolean,             // User đánh dấu yêu thích
  tags: string[],                   // Tag thủ công của user

  // Timestamps
  savedAt: Date,                    // Thời điểm lưu
  lastReviewedAt: Date | null,      // Lần ôn tập gần nhất
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
// Query chính: lấy câu của 1 user, sắp theo thời gian
db.sentences.createIndex({ userId: 1, createdAt: -1 })

// Filter theo trạng thái phân tích
db.sentences.createIndex({ userId: 1, analysisStatus: 1 })

// Tránh phân tích AI trùng lặp (check cache ở application level)
db.sentences.createIndex({ textHash: 1 })

// Text search
db.sentences.createIndex({ text: "text" })

// Soft delete filter
db.sentences.createIndex({ userId: 1, isArchived: 1, createdAt: -1 })

// Domain grouping
db.sentences.createIndex({ userId: 1, sourceDomain: 1 })
```

**Lý do thiết kế:**
- `textHash` dùng để kiểm tra câu trùng lặp trước khi đẩy vào queue → tiết kiệm AI credits
- `sourceDomain` tách riêng để có thể group "câu từ BBC" hay "câu từ Reddit" dễ dàng
- `isArchived` thay vì xóa thật → user có thể khôi phục, dữ liệu phân tích không mất

---

## 3. Collection: `sentence_analyses`

Lưu kết quả phân tích AI cho từng câu (1-1 với sentences).

```typescript
{
  _id: ObjectId,

  // Reference
  sentenceId: ObjectId,             // Reference tới sentences._id
  textHash: string,                 // Hash của câu (để lookup cache)

  // Kết quả phân tích AI
  translation: string,              // Bản dịch tiếng Việt

  grammar: {
    structure: string,              // Mô tả cấu trúc ngữ pháp (vd: "S + V + O")
    tense: string,                  // Thì sử dụng
    explanation: string,            // Giải thích chi tiết bằng tiếng Việt
    highlights: [                   // Highlight từng phần trong câu
      {
        text: string,               // Đoạn text trong câu gốc
        role: string,               // Vai trò: "subject", "verb", "object"...
        explanation: string,
      }
    ]
  },

  vocabulary: [
    {
      word: string,                 // Từ vựng
      meaning: string,              // Nghĩa tiếng Việt
      pronunciation: string,        // Phiên âm IPA
      partOfSpeech: string,         // "noun" | "verb" | "adjective"...
      examples: string[],           // 2-3 câu ví dụ khác
      synonyms: string[],           // Từ đồng nghĩa
      level: string,                // "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
      vocabId: ObjectId | null,     // Reference tới vocabulary collection (sau khi sync)
    }
  ],

  context: string,                  // Giải thích ngữ cảnh sử dụng câu này

  similarSentences: string[],       // 3-5 câu tương tự

  // Metadata
  aiModel: string,                  // "gpt-4o" | "gemini-1.5-pro"
  processingTimeMs: number,         // Thời gian xử lý
  tokensUsed: number,               // Tokens tiêu thụ (cost tracking)

  createdAt: Date,
}
```

**Indexes:**
```javascript
// Lookup theo sentenceId
db.sentence_analyses.createIndex({ sentenceId: 1 }, { unique: true })

// Cache lookup theo text hash
db.sentence_analyses.createIndex({ textHash: 1 })
```

**Lý do thiết kế:**
- Tách ra collection riêng (không embed vào sentences) vì document có thể rất lớn (nhiều từ vựng, ví dụ)
- `textHash` index để Worker kiểm tra "câu này đã từng phân tích chưa" trước khi gọi AI
- `aiModel` và `tokensUsed` để tracking chi phí và debugging

---

## 4. Collection: `vocabulary`

Kho từ vựng dùng chung giữa các user (deduplication).

```typescript
{
  _id: ObjectId,

  word: string,                     // Từ vựng (lowercase, normalized)
  pronunciation: string,            // Phiên âm IPA
  partOfSpeech: string,             // "noun" | "verb" | "adjective" | "adverb"...
  meanings: [
    {
      language: string,             // "vi" | "ja" | "ko"...
      meaning: string,              // Nghĩa theo ngôn ngữ
    }
  ],
  examples: string[],               // Câu ví dụ
  synonyms: string[],               // Từ đồng nghĩa
  antonyms: string[],               // Từ trái nghĩa
  level: string,                    // CEFR level: A1→C2
  topics: string[],                 // Chủ đề: ["technology", "business"]

  // Metadata
  frequency: number,                // Số lần xuất hiện trong các sentences (denormalized)
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
// Tìm từ chính xác
db.vocabulary.createIndex({ word: 1, partOfSpeech: 1 }, { unique: true })

// Text search
db.vocabulary.createIndex({ word: "text" })

// Filter theo level
db.vocabulary.createIndex({ level: 1 })

// Filter theo topic
db.vocabulary.createIndex({ topics: 1 })
```

**Lý do thiết kế:**
- Collection dùng chung để tránh lưu cùng 1 từ nhiều lần trong DB
- `frequency` denormalized để sort từ vựng phổ biến nhất (sync qua background job)
- Hỗ trợ đa ngôn ngữ trong `meanings` ngay từ đầu

---

## 5. Collection: `user_vocabulary_progress`

Theo dõi tiến độ học từng từ của từng user (Spaced Repetition).

```typescript
{
  _id: ObjectId,

  // Ownership
  userId: ObjectId,                 // Reference tới users._id
  vocabId: ObjectId,                // Reference tới vocabulary._id
  word: string,                     // Denormalized để tránh lookup

  // Trạng thái học
  status: "new" | "learning" | "reviewing" | "mastered",
  isKnown: boolean,                 // User đánh dấu "đã biết" thủ công

  // Spaced Repetition (SM-2 algorithm)
  repetitionCount: number,          // Số lần đã ôn (n)
  easeFactor: number,               // Độ dễ (EF), khởi đầu 2.5
  intervalDays: number,             // Khoảng cách ôn tập (ngày)
  nextReviewAt: Date,               // Ngày ôn tập tiếp theo
  lastReviewedAt: Date | null,      // Ngày ôn tập gần nhất

  // Lịch sử
  reviewHistory: [
    {
      reviewedAt: Date,
      quality: number,              // 0-5: chất lượng trả lời (SM-2 input)
      intervalBefore: number,       // Interval trước khi ôn
    }
  ],

  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
// Unique: mỗi user chỉ có 1 record cho mỗi từ
db.user_vocabulary_progress.createIndex(
  { userId: 1, vocabId: 1 },
  { unique: true }
)

// Query từ cần ôn hôm nay
db.user_vocabulary_progress.createIndex({ userId: 1, nextReviewAt: 1 })

// Filter theo status
db.user_vocabulary_progress.createIndex({ userId: 1, status: 1 })

// Filter theo isKnown
db.user_vocabulary_progress.createIndex({ userId: 1, isKnown: 1 })
```

**Lý do thiết kế:**
- `reviewHistory` giới hạn 50 entries gần nhất (MongoDB capped hoặc application-level trim)
- SM-2 algorithm: dùng `easeFactor` và `intervalDays` để tính lịch ôn tập
- `word` denormalized để tránh $lookup khi render danh sách từ cần học

---

## 🔗 Mối Quan Hệ Và Các Query Quan Trọng

### Query 1: Lấy danh sách câu của user (Dashboard)
```javascript
db.sentences.find({
  userId: ObjectId("..."),
  isArchived: false
})
.sort({ createdAt: -1 })
.limit(20)
.skip(offset)
```

### Query 2: Kiểm tra câu đã được phân tích chưa (Worker)
```javascript
// Bước 1: Check Redis cache trước
// Key: `analysis:${textHash}`

// Bước 2: Nếu miss, check DB
db.sentence_analyses.findOne({ textHash: "..." })
```

### Query 3: Lấy từ cần ôn tập hôm nay (Spaced Repetition)
```javascript
db.user_vocabulary_progress.find({
  userId: ObjectId("..."),
  isKnown: false,
  nextReviewAt: { $lte: new Date() }
})
.sort({ nextReviewAt: 1 })
.limit(20)
```

### Query 4: Tìm kiếm câu (Full-text search)
```javascript
db.sentences.find({
  userId: ObjectId("..."),
  $text: { $search: "keyword" },
  isArchived: false
})
```

---

## 📝 Ghi Chú Quan Trọng

1. **Không dùng foreign key constraint** (MongoDB không hỗ trợ) → application phải tự validate
2. **Soft delete** thay vì hard delete (`isArchived: true`) để bảo toàn dữ liệu phân tích
3. **Denormalization** ở một số field (stats, word) để tránh N+1 queries
4. **textHash** là chìa khóa để tái sử dụng kết quả AI — luôn normalize (trim, lowercase) trước khi hash
5. **TTL index** cho các collection tạm thời (nếu cần) — chưa implement trong MVP
