# 🔧 SNIP-LANG — Backend Development Guide

## Tổng Quan

Backend được xây dựng với **Node.js + Express + TypeScript**, theo kiến trúc **Module-based** (mỗi feature là 1 folder riêng biệt). Sử dụng MongoDB (Mongoose), Redis (ioredis), BullMQ cho queue, và Google Gemini 2.0 Flash cho AI.

---

## 📁 Cấu Trúc Module

Mỗi module có đúng 4 file, không hơn không kém:

```
modules/
└── {feature}/
    ├── {feature}.types.ts      # Zod schemas + TypeScript interfaces
    ├── {feature}.service.ts    # Business logic + DB queries
    ├── {feature}.controller.ts # HTTP handlers (validate → delegate → respond)
    └── {feature}.route.ts      # Route definitions + middleware binding
```

**Nguyên tắc:**
- Controller KHÔNG chứa business logic, chỉ parse input và gọi service
- Service KHÔNG biết gì về HTTP (req, res) — chỉ nhận plain data, trả plain data
- Tất cả validation dùng Zod schema trong types file

---

## ⚡ Quy Trình Phát Triển

### 1. Setup môi trường

```bash
# Copy file env
cp .env.example .env
# Điền các giá trị cần thiết vào .env

# Cài dependencies
yarn install

# Chạy dev server (hot-reload)
yarn dev
```

### 2. Yêu cầu
- MongoDB đang chạy tại `MONGODB_URI`
- Redis đang chạy tại `REDIS_URL`
- Đã có `GEMINI_API_KEY` từ [Google AI Studio](https://aistudio.google.com)

---

## 🔑 Lấy Gemini API Key (Miễn Phí)

1. Truy cập [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Copy key → paste vào `.env` tại `GEMINI_API_KEY=...`

**Giới hạn Free Tier:**
- 15 requests/phút (RPM)
- 1,500 requests/ngày
- 1 triệu tokens/phút

Đủ dùng cho MVP và test. Nếu cần scale, upgrade lên tier trả phí.

---

## 🌐 API Endpoints

### Auth (`/api/auth`)

| Method | Path | Body | Mô tả |
|---|---|---|---|
| POST | `/register` | `{email, password, displayName}` | Đăng ký |
| POST | `/login` | `{email, password}` | Đăng nhập |
| POST | `/refresh` | `{refreshToken}` | Làm mới access token |
| GET | `/me` | — | Thông tin user hiện tại |

### Sentences (`/api/sentences`) — Yêu cầu JWT

| Method | Path | Mô tả |
|---|---|---|
| POST | `/` | Lưu câu mới từ extension |
| GET | `/` | Lấy danh sách câu (có phân trang + filter) |
| GET | `/:id` | Chi tiết câu + kết quả phân tích AI |
| DELETE | `/:id` | Xoá mềm câu |
| PATCH | `/:id/favorite` | Toggle yêu thích |

### Query params cho GET `/api/sentences`

| Param | Type | Mô tả |
|---|---|---|
| `page` | number | Trang (default: 1) |
| `limit` | number | Số câu/trang (max 50) |
| `search` | string | Full-text search |
| `status` | string | `pending\|processing\|completed\|failed` |
| `domain` | string | Filter theo domain web |
| `isFavorited` | boolean | Chỉ hiển thị câu yêu thích |

---

## 🔄 Luồng Xử Lý AI

```
POST /api/sentences
    │
    ├── Tạo document trong MongoDB (status: "pending")
    │
    ├── Check Redis cache (key: analysis:{sha256(text)})
    │   ├── Hit → reuse kết quả cũ → status: "completed" ngay lập tức
    │   └── Miss → push job vào BullMQ queue
    │
    └── Response: { sentenceId, status: "pending" }

[BullMQ Worker - chạy song song]
    │
    ├── Nhận job từ queue
    ├── Check MongoDB: SentenceAnalysis.findOne({textHash})
    │   ├── Tồn tại → reuse, bỏ qua AI call
    │   └── Không → gọi Gemini 2.0 Flash API
    │
    ├── Lưu kết quả vào SentenceAnalysis collection
    ├── Update Sentence.analysisStatus = "completed"
    └── Set Redis cache (TTL: 30 ngày)
```

---

## 📦 Core Infrastructure

### `src/core/config.ts`
Config tập trung, validate env khi khởi động. Nếu thiếu biến bắt buộc → throw error ngay lập tức.

### `src/core/database/connection.ts`
MongoDB connection với connection pooling (maxPoolSize: 10).

### `src/core/redis/client.ts`
Redis singleton + `CacheKeys` helper để tránh lỗi typo trong cache keys.

### `src/core/queue/index.ts`
BullMQ factory functions: `createQueue()` và `createWorker()`. Worker có retry 3 lần với exponential backoff.

### `src/core/ai/gemini.service.ts`
Gọi Gemini 2.0 Flash với `responseMimeType: 'application/json'` → trả về structured JSON trực tiếp, không cần parse thủ công.

### `src/middleware/auth.middleware.ts`
- `authenticate`: validate JWT, gắn `req.user` vào request
- `asyncHandler`: wrapper để không cần try/catch trong mỗi controller

---

## 🚀 Deploy

### Vercel (test)
Vercel chạy serverless, không hỗ trợ long-running process như BullMQ Worker. 

**Giải pháp**: Tách Worker ra chạy riêng hoặc dùng trigger từ Vercel Cron Jobs. Chi tiết trong `docs/deploy-guide.md` (sẽ bổ sung).

### VPS (production)
```bash
yarn build
pm2 start dist/server.js --name snip-lang-api
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Không commit file `.env`** — chỉ commit `.env.example`
2. **textHash luôn normalize** trước khi hash: `text.toLowerCase().trim()`
3. **Rate limit**: 100 req/phút/IP — tăng nếu extension gửi nhiều request hơn
4. **BullMQ cần Redis** — không có Redis thì queue không hoạt động
