Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## How to Run (Frontend Dev / Build + Serve)

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
