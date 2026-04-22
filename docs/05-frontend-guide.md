# 🌐 SNIP-LANG — Frontend Development Guide

## Tổng Quan

Frontend được xây dựng bằng **Next.js 14 (App Router)** và **TailwindCSS**. Giao diện tập trung vào trải nghiệm Dark Theme hiện đại (Glassmorphism), mượt mà, tối ưu UX cho việc xem lại các câu tiếng Anh đã lưu.

---

## 📁 Cấu Trúc Thư Mục

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout (fonts, global styles)
│   ├── page.tsx                   # Landing page
│   ├── login/                     # Đăng nhập / Đăng ký
│   └── dashboard/
│       ├── layout.tsx             # Dashboard layout (Sidebar + Header)
│       ├── page.tsx               # Danh sách câu đã lưu
│       ├── vocabulary/            # Danh sách từ vựng
│       └── sentences/[id]/        # Chi tiết kết quả AI phân tích câu
├── components/                    # Các UI Components tái sử dụng
├── lib/
│   └── api.ts                     # Axios/Fetch wrapper tự động gán JWT
├── tailwind.config.js             # Cấu hình màu sắc, animation
└── globals.css                    # Tailwind + Custom utilities (Glassmorphism)
```

---

## 🎨 Design System (Tailwind)

Hệ thống màu sắc (Dark Theme):
- `background`: `#08080f` (Đen pha xanh dương tối)
- `primary`: `#6366f1` (Indigo 500)
- `secondary`: `#8b5cf6` (Violet 500)

**Class quan trọng:**
- `.glass-panel`: Hiệu ứng kính mờ (blur background), viền sáng mờ, dùng cho các card hiển thị.
- `.text-gradient`: Chữ đổ màu gradient cho các tiêu đề quan trọng.

---

## ⚡ Các Tính Năng Chính

### 1. Authentication (`app/login/page.tsx`)
- Đăng nhập/Đăng ký qua form.
- JWT Access Token được lưu ở `localStorage`.
- API utility (`lib/api.ts`) tự động thêm `Bearer <token>` vào mọi request. Nếu token hết hạn (401), tự động redirect về trang login.

### 2. Dashboard (`app/dashboard/page.tsx`)
- Lấy danh sách câu đã lưu qua API `GET /api/sentences`.
- Hiển thị trạng thái phân tích AI (pending, processing, completed, failed).

### 3. Chi Tiết Câu (`app/dashboard/sentences/[id]/page.tsx`)
- Render JSON có cấu trúc từ Gemini AI.
- Layout rõ ràng: Cấu trúc câu → Từ vựng (với IPA, từ loại, ví dụ) → Ngữ cảnh sử dụng → Câu tương tự.

### 4. Quản Lý Từ Vựng (`app/dashboard/vocabulary/page.tsx`)
- Liệt kê các từ vựng đã được trích xuất từ câu.
- Hiển thị ngày ôn tập tiếp theo (dựa trên thuật toán Spaced Repetition ở backend).
- Cho phép người dùng đánh dấu "Đã biết" để ẩn từ vựng khỏi lộ trình học.

---

## 🚀 Chạy Project

```bash
# Cài đặt
npm install

# Dev server (localhost:3000)
npm run dev

# Build production
npm run build
npm start
```
