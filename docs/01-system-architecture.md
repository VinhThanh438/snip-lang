# 🏗️ SNIP-LANG — Kiến Trúc Hệ Thống

## Tổng Quan

SNIP-LANG là hệ thống học tiếng Anh thông minh cho người dùng Việt Nam. Người dùng bôi đen văn bản tiếng Anh trên trình duyệt → Extension hiển thị bản dịch → Lưu câu vào hệ thống → AI phân tích sâu → Học từ vựng theo lộ trình.

---

## 📐 Sơ Đồ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                                │
│                                                                     │
│  ┌──────────────────────┐        ┌──────────────────────────────┐  │
│  │   Chrome Extension   │        │      Next.js Web App         │  │
│  │   (Manifest V3)      │        │      (App Router)            │  │
│  │                      │        │                              │  │
│  │  • Content Script    │        │  • /login                    │  │
│  │  • Background Script │        │  • /dashboard                │  │
│  │  • Popup UI          │        │  • /sentences/[id]           │  │
│  │  • Tooltip Overlay   │        │  • /settings                 │  │
│  └──────────┬───────────┘        └──────────────┬───────────────┘  │
│             │ HTTPS/JWT                         │ HTTPS/JWT         │
└─────────────┼─────────────────────────────────-─┼──────────────────┘
              │                                   │
              ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                              │
│                    Node.js + Express                                │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  /auth   │  │/sentences│  │ /vocab   │  │   /analysis      │   │
│  │  module  │  │  module  │  │  module  │  │     module       │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                                     │
│  Middleware: JWT Auth │ Rate Limiter │ CORS │ Request Validator     │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
       ┌───────────┼───────────────┐
       │           │               │
       ▼           ▼               ▼
┌──────────┐ ┌──────────┐  ┌─────────────────────────────────────────┐
│ MongoDB  │ │  Redis   │  │           BullMQ Queue System           │
│          │ │  Cache   │  │                                         │
│ • Users  │ │          │  │  ┌─────────────┐  ┌──────────────────┐ │
│ • Senten │ │ • Senten │  │  │  ai-analysis│  │   AI Worker      │ │
│   ces    │ │   ce     │  │  │  Queue      │──▶  (processes job) │ │
│ • Vocab  │ │   cache  │  │  └─────────────┘  └────────┬─────────┘ │
│ • Analys │ │ • Token  │  │                            │           │
│   is     │ │   cache  │  │                            ▼           │
│ • Progre │ │          │  │                   ┌─────────────────┐  │
│   ss     │ │          │  │                   │   AI Service    │  │
└──────────┘ └──────────┘  │                   │ (OpenAI/Gemini) │  │
                           │                   └─────────────────┘  │
                           └─────────────────────────────────────────┘
```

---

## 🔄 Luồng Xử Lý Chính (Data Flow)

### Luồng 1: Lưu Câu Từ Extension

```
1. User bôi đen text trên trình duyệt
         │
         ▼
2. Content Script phát hiện → hiển thị Tooltip
         │
         ▼
3. User click "Save" → Background Script gửi API request
         │  POST /api/sentences
         │  Headers: Authorization: Bearer <JWT>
         │  Body: { text, sourceUrl, sourceTitle }
         ▼
4. API Server nhận request → validate → lưu vào MongoDB
         │
         ▼
5. Server đẩy job vào BullMQ Queue (ai-analysis)
         │
         ▼
6. Response trả về ngay cho Extension { sentenceId, status: "pending" }
         │
         ▼
7. Worker nhận job từ Queue
         │
         ├── Check Redis cache: sentence đã được phân tích chưa?
         │      ├── Có → dùng cache, bỏ qua AI call
         │      └── Không → gọi AI Service
         ▼
8. AI Service phân tích → trả về JSON có cấu trúc
         │
         ▼
9. Worker lưu kết quả vào MongoDB (SentenceAnalysis collection)
         │
         ▼
10. Worker cập nhật Redis cache với key = hash(sentence)
         │
         ▼
11. Worker emit event → cập nhật trạng thái sentence → "analyzed"
```

### Luồng 2: Xem Chi Tiết Câu Trên Web App

```
1. User click vào câu trên Dashboard
         │
         ▼
2. Next.js fetch GET /api/sentences/:id
         │
         ▼
3. API kiểm tra phân tích đã có chưa
         ├── Chưa → trả về { status: "pending" } → polling
         └── Rồi → trả về full analysis data
         │
         ▼
4. Frontend render giao diện học từ vựng, ngữ pháp, ví dụ
```

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
snip-lang/
├── docs/                          # Tài liệu dự án
│   ├── 01-system-architecture.md
│   ├── 02-database-schema.md
│   ├── 03-backend-guide.md
│   ├── 04-extension-guide.md
│   └── 05-frontend-guide.md
│
├── backend/                       # Node.js + Express API
│   ├── src/
│   │   ├── modules/               # Feature-based modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.route.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.types.ts
│   │   │   ├── sentences/
│   │   │   │   ├── sentences.controller.ts
│   │   │   │   ├── sentences.route.ts
│   │   │   │   ├── sentences.service.ts
│   │   │   │   └── sentences.types.ts
│   │   │   ├── vocabulary/
│   │   │   │   ├── vocabulary.controller.ts
│   │   │   │   ├── vocabulary.route.ts
│   │   │   │   ├── vocabulary.service.ts
│   │   │   │   └── vocabulary.types.ts
│   │   │   └── analysis/
│   │   │       ├── analysis.controller.ts
│   │   │       ├── analysis.route.ts
│   │   │       ├── analysis.service.ts
│   │   │       └── analysis.types.ts
│   │   ├── core/                  # Shared infrastructure
│   │   │   ├── database/          # MongoDB connection
│   │   │   ├── redis/             # Redis client
│   │   │   ├── queue/             # BullMQ setup
│   │   │   └── ai/                # AI service wrapper
│   │   ├── middleware/            # Express middlewares
│   │   ├── workers/               # BullMQ workers
│   │   └── app.ts                 # Express app entry
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # Next.js App
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── sentences/[id]/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   └── package.json
│
└── extension/                     # Chrome Extension MV3
    ├── src/
    │   ├── content/               # Content scripts
    │   ├── background/            # Service worker
    │   └── popup/                 # Extension popup UI
    ├── public/
    │   └── manifest.json
    └── package.json
```

---

## 🔐 Chiến Lược Authentication

```
┌──────────────────────────────────────────────────────┐
│                  Auth Flow                           │
│                                                      │
│  Google OAuth2 ──┐                                   │
│                  ├──▶ Backend validates              │
│  Email/Password ─┘         │                        │
│                             ▼                        │
│                    Issue JWT (Access Token)           │
│                    + Refresh Token                   │
│                             │                        │
│                    ┌────────┴────────┐               │
│                    ▼                ▼               │
│             Web App             Extension            │
│         (Cookie/LocalStorage)  (chrome.storage)      │
└──────────────────────────────────────────────────────┘
```

**Quyết định thiết kế:**
- **Access Token**: JWT, TTL 15 phút
- **Refresh Token**: Stored in httpOnly Cookie (web) / chrome.storage.local (extension), TTL 7 ngày
- **Extension**: Dùng OAuth2 của Google thông qua `chrome.identity` API

---

## ⚡ Chiến Lược Cache (Redis)

| Key Pattern | Value | TTL |
|---|---|---|
| `analysis:{hash(sentence)}` | JSON analysis result | 30 ngày |
| `user:session:{userId}` | Session metadata | 15 phút |
| `rate:limit:{ip}` | Request count | 1 phút |

**Lý do dùng hash(sentence) làm key**: Cùng một câu có thể được nhiều user lưu — không cần gọi AI nhiều lần cho cùng nội dung.

---

## 🚀 Các Công Nghệ Sử Dụng

| Layer | Technology | Lý do chọn |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR/SSG, routing tốt |
| Styling | TailwindCSS | Utility-first, nhanh |
| Backend | Node.js + Express + TypeScript | Quen thuộc, linh hoạt |
| Database | MongoDB | Schema linh hoạt cho dữ liệu phân tích |
| Cache | Redis | In-memory, TTL support |
| Queue | BullMQ | Built on Redis, reliable |
| AI | OpenAI GPT-4o / Google Gemini | Structured JSON output |
| Extension | Chrome MV3 | Standard hiện đại |
| Auth | JWT + Google OAuth2 | Secure, phổ biến |
