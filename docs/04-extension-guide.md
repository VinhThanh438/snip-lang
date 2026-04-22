# 🔌 SNIP-LANG — Extension Development Guide

## Tổng Quan

Extension được phát triển theo tiêu chuẩn **Manifest V3**. Mục tiêu chính là cung cấp trải nghiệm mượt mà khi người dùng đọc tài liệu tiếng Anh: bôi đen → dịch nhanh → lưu câu để học sâu hơn.

---

## 📁 Cấu Trúc File

```
extension/
├── manifest.json          # Cấu hình MV3, permissions
├── background.js          # Service worker: gọi API, xử lý state
├── content.js             # Bắt event bôi đen, hiển thị Tooltip UI
├── popup.html             # UI khi click vào icon extension
├── popup.css              # Style cho popup
└── popup.js               # Logic của popup (auth, toggle settings)
```

---

## ⚡ Các Tính Năng & Luồng Xử Lý

### 1. Tooltip Dịch Thuật & Lưu Câu (`content.js`)
- Lắng nghe event `mouseup`. Nếu user bôi đen một đoạn text (từ 3 - 2000 ký tự), sẽ hiển thị Tooltip ngay tại vị trí bôi đen.
- Giao diện Tooltip được inject trực tiếp vào trang web (shadow DOM hoặc z-index cao) với phong cách Glassmorphism đồng nhất với Web App.
- Nếu user đã login và bật "Tự động dịch", gửi message `TRANSLATE` đến `background.js` để gọi API và lấy bản dịch.
- Nút **Lưu câu**: Gửi message `SAVE_SENTENCE` với đoạn text và URL trang web hiện tại.

### 2. Giao Tiếp Background (`background.js`)
- Không gọi trực tiếp API từ `content.js` để tránh lỗi CORS trên các trang web lạ.
- `background.js` nhận message từ content script, kèm theo token (lấy từ `chrome.storage.local`), sau đó gọi request tới Backend API (`http://localhost:4000/api`).
- Xử lý các task ngầm: `LOGIN`, `LOGOUT`, `GET_USER`, `SAVE_SENTENCE`, `TRANSLATE`.

### 3. Popup Quản Lý (`popup.html` & `popup.js`)
- Hiển thị UI ngay khi click icon.
- Màn hình Đăng nhập (nếu chưa login) → Gửi thông tin tới `background.js` để gọi API lấy JWT và lưu vào `chrome.storage`.
- Màn hình Main: Hiển thị avatar, nút bật/tắt (Enable extension, Auto-translate) và link mở Dashboard.

---

## 🛠️ Cách Cài Đặt (Development)

1. Mở Chrome, truy cập: `chrome://extensions/`
2. Bật **Developer mode** (Góc trên bên phải)
3. Chọn **Load unpacked**
4. Trỏ thư mục chọn thư mục `snip-lang/extension/`

Lưu ý: Bạn phải chạy Backend server (`npm run dev` trong `backend/`) thì extension mới có thể đăng nhập và hoạt động.

---

## 🔒 Permissions & Security

- `activeTab`: Lấy thông tin URL, title trang hiện tại để lưu kèm câu.
- `storage`: Lưu JWT, user info và cấu hình settings.
- `host_permissions`: Cần quyền truy cập vào `http://localhost:4000/*` (Backend API). Khi deploy, cần cập nhật bằng URL thực tế của server.
