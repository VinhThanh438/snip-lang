# 🧠 SNIP-LANG

> Hệ thống học tiếng Anh thông minh cho người Việt — bôi đen, lưu câu, AI phân tích sâu.

---

## 📚 Tài Liệu Dự Án

| # | Tài liệu | Mô tả |
|---|---|---|
| 01 | [Kiến trúc hệ thống](./docs/01-system-architecture.md) | Sơ đồ tổng thể, data flow, cấu trúc thư mục |
| 02 | [MongoDB Schema](./docs/02-database-schema.md) | Thiết kế collections, indexes, relationships |
| 03 | [Backend Guide](./docs/03-backend-guide.md) | Hướng dẫn setup và phát triển API |
| 04 | [Extension Guide](./docs/04-extension-guide.md) | Hướng dẫn Chrome Extension MV3 |
| 05 | [Frontend Guide](./docs/05-frontend-guide.md) | Hướng dẫn Next.js App |

---

## 🏗️ Cấu Trúc Thư Mục

```
snip-lang/
├── docs/           # 📄 Tài liệu kỹ thuật
├── backend/        # 🔧 Node.js + Express API
├── frontend/       # 🌐 Next.js Web App
└── extension/      # 🔌 Chrome Extension MV3
```

---

## 🚀 Quick Start

> Chi tiết trong từng thư mục con. Tài liệu sẽ được cập nhật theo tiến độ phát triển.

### Yêu cầu
- Node.js >= 18
- MongoDB >= 6
- Redis >= 7
- npm hoặc pnpm

---

## 📋 Tiến Độ MVP

- [x] **Bước 1**: Thiết kế kiến trúc hệ thống
- [x] **Bước 2**: Thiết kế MongoDB Schema
- [ ] **Bước 3**: Setup backend (Express + MongoDB + Redis)
- [ ] **Bước 4**: Implement Authentication
- [ ] **Bước 5**: Implement Sentence APIs
- [ ] **Bước 6**: Setup BullMQ Worker
- [ ] **Bước 7**: Tích hợp AI Service
- [ ] **Bước 8**: Xây dựng Chrome Extension
- [ ] **Bước 9**: Xây dựng Next.js Frontend
- [ ] **Bước 10**: Kết nối toàn bộ hệ thống
