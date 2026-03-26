# README (Python) - How to Run

Project này là frontend **Vite + React + TypeScript**. Vì vậy, để chạy/tạo bản build bạn vẫn cần **Node.js & npm**. Phần “Python” trong tài liệu này chỉ dùng để **serve (mở) bản build tĩnh** (không cần backend Python).

---

## 1) Yêu cầu cài đặt

- **Node.js & npm**: dùng để cài dependencies và chạy `npm run dev` / `npm run build`
- **Python 3**: dùng để serve thư mục `dist` bằng `http.server`

Kiểm tra nhanh:

```bash
node -v
npm -v
python --version
```

> Trên Windows đôi khi lệnh là `py` thay cho `python`.

---

## 2) Chạy chế độ phát triển (Dev Server)

```bash
# Bước 1: vào thư mục dự án
cd <YOUR_PROJECT_FOLDER>

# Bước 2: cài dependencies
npm i

# Bước 3: chạy dev server (auto reload)
npm run dev
```

Mở trình duyệt theo URL mà Vite in ra (thường là `http://localhost:5173`).

---

## 3) Build bản production & serve bằng Python (khuyến nghị)

### 3.1 Build

```bash
cd <YOUR_PROJECT_FOLDER>
npm run build
```

Sau khi build xong, Vite sẽ tạo thư mục `dist/`.

### 3.2 Serve `dist/` bằng Python

Chạy từ thư mục `dist`:

```python
python -m http.server 8000
```

Nếu máy bạn dùng `py`:

```python
py -m http.server 8000
```

Mở:

- `http://localhost:8000`

> Khi serve bằng `http.server`, nếu bạn cần xử lý SPA routing (refresh trang con), bạn có thể cần cấu hình server phù hợp. Với demo nội bộ thường vẫn hoạt động tốt.

---

## 4) Ghi chú

- Thư mục `dist/` là bản build tĩnh. Python chỉ đóng vai trò “web server” để bạn xem giao diện.
- Nếu bạn có **backend Python** thực sự (ví dụ Flask/FastAPI) thì bạn cần cung cấp cấu trúc/endpoint tương ứng; tài liệu này hiện chỉ hướng dẫn cho phần frontend của dự án.

