# CongiVec - Ứng Dụng Quản Lý Công Việc Cá Nhân & Lịch Học

Ứng dụng web hiện đại kết hợp giữa **Google Calendar**, **Todo List**, **Lịch học sinh viên** và **Dashboard quản lý công việc**, được tối ưu hóa ưu tiên tiếng Việt, hỗ trợ giao diện Responsive Mobile (Bottom Navigation) & Desktop (Sidebar), PWA (Progressive Web App), Dark Mode và Firebase.

---

## 🌟 Tính Năng Nổi Bật

1. **Dashboard Trực Quan**:
   - Phần đầu hiển thị cực lớn: `THỨ BẢY` / `12/09/2026`.
   - Widget **SẮP DIỄN RA** đếm ngược từng giây/phút, tự động hiển thị cảnh báo nổi bật khi còn `< 30 phút` và cảnh báo `"Sắp đến giờ!"` khi còn `< 10 phút`.
   - **Timeline Hôm Nay**: Dòng thời gian theo giờ, highlight sự kiện gần nhất tiếp theo.
   - Widget **NGÀY MAI**: Giúp chuẩn bị trước lịch cho ngày kế tiếp, hạn chế quên lịch.
   - Thống kê: Việc hôm nay, Lịch sắp tới, Việc quá hạn, Deadline gần nhất, Số việc đã xong/chưa xong.

2. **Lịch Toàn Diện (FullCalendar - `/calendar`)**:
   - 4 chế độ xem nhanh: **Tháng**, **Tuần**, **Ngày**, **Danh sách**.
   - Phân biệt màu sắc theo Loại: Học tập (xanh dương), Công việc (cam), Deadline (đỏ), Họp (tím), Cá nhân (xanh lá), Online (cyan).
   - Nhấn trực tiếp vào ngày để thêm lịch, bấm vào sự kiện để xem chi tiết / chỉnh sửa / xóa.

3. **Kiểm Tra Trùng Lịch (Conflict Detection)**:
   - Tự động phát hiện khi khoảng thời gian tạo mới bị trùng với lịch hiện có.
   - Cảnh báo tên lịch đang bị trùng và cho phép: *Chỉnh giờ lại*, *Vẫn lưu*, hoặc *Hủy*.

4. **Thêm Lịch Nhanh (Smart Add)**:
   - Phân tích cú pháp tự nhiên tiếng Việt: ví dụ *"Họp phòng CNTT ngày mai 8h"*, *"Học online thứ 2 8h"*.
   - Nhận diện Title, Ngày, Giờ, Loại sự kiện và Địa điểm với chế độ Preview xác nhận trước khi lưu.

5. **Lịch Học & Thời Khóa Biểu (`/study`)**:
   - Quản lý Môn học, Tên lớp, Giảng viên, Phòng học, Hình thức (Trực tiếp, Online, Điểm cầu).
   - **Nhập nhiều ngày một lần (Multi-date bulk input)**: Chọn hoặc dán danh sách nhiều ngày học (ví dụ: `11/10/2026, 18/10/2026, 01/11/2026...`), hệ thống tự động sinh tất cả các buổi học tương ứng.

6. **Quản Lý Công Việc & Checklist (`/tasks`)**:
   - Trạng thái: Chưa làm, Đang làm, Hoàn thành, Quá hạn.
   - Tự động đánh dấu **QUÁ HẠN** màu đỏ nếu đã qua deadline mà chưa hoàn thành.
   - Checklist con với hiển thị tiến độ trực quan: `3 / 5 (60%)`.
   - Hiệu ứng pháo hoa chúc mừng (Confetti) khi hoàn thành công việc.

7. **Chế Độ Xem Buổi Sáng (`/today`)**:
   - Phân chia thành 4 ca trong ngày: **Sáng (04:00 - 11:59)**, **Trưa (12:00 - 13:59)**, **Chiều (14:00 - 17:59)**, **Tối (18:00 - 23:59)**.

8. **Tiến Trình Sắp Tới (`/upcoming`)**:
   - Xem nhanh dòng thời gian 7 ngày tới, 30 ngày tới và các deadline gấp nhất.

9. **Thống Kê Hiệu Suất (`/statistics`)**:
   - Tỷ lệ hoàn thành công việc, thời lượng phân bổ giữa Học tập và Công việc/Họp.

10. **Giao Diện & PWA**:
    - Chế độ **Sáng (Light)** / **Tối (Dark)** / **Hệ thống (System)** hoàn chỉnh.
    - Mobile-First: Bottom navigation với nút `+` nổi bật ở chính giữa.
    - Cài đặt PWA lên màn hình chính (Add to Home Screen).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 16 (App Router), TypeScript (Strict), Tailwind CSS, Lucide Icons.
- **Lịch**: FullCalendar (@fullcalendar/react, daygrid, timegrid, list, interaction).
- **Backend & Database**: Firebase Authentication, Cloud Firestore, Firebase Cloud Messaging.
- **Chế độ Chạy Thử (Offline/Demo Mode)**: Tự động kích hoạt khi chưa có API key Firebase, nạp sẵn dữ liệu demo phong phú, đảm bảo chạy và build 100% không bị lỗi.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu môi trường
- Node.js version 18 trở lên (khuyến nghị v20+ hoặc v24+).
- npm hoặc yarn/pnpm.

### 2. Cài đặt Dependencies
Mở PowerShell hoặc Terminal tại thư mục dự án:
```powershell
npm install --legacy-peer-deps
```

### 3. Cấu hình Firebase (`.env.local`)
Tạo file `.env.local` tại thư mục gốc (tham khảo `.env.example`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

> **Lưu ý**: Nếu bạn chưa có dự án Firebase, bạn vẫn có thể khởi chạy ngay! Ứng dụng sẽ tự động chạy ở chế độ **Local Demo Fallback**, có sẵn nút **"Trải nghiệm ngay (Chế độ Demo)"** để thử toàn bộ chức năng.

### 4. Thiết Lập Firebase Console (Khi Triển Khai Thực Tế)
1. Truy cập [Firebase Console](https://console.firebase.google.com/) và tạo project mới.
2. Bật **Authentication**: Kích hoạt phương thức đăng nhập bằng **Google** và **Email/Password**.
3. Bật **Cloud Firestore**: Chọn chế độ Start in test mode hoặc áp dụng file `firestore.rules` có sẵn trong dự án:
   ```
   firestore.rules
   ```
4. Copy các khóa API từ mục **Project settings > General > Your apps** dán vào `.env.local`.

### 5. Chạy Môi Trường Phát Triển (Development)
```powershell
npm run dev
```
Mở trình duyệt và truy cập: `http://localhost:3000`

### 6. Build Production
Kiểm tra và biên dịch mã nguồn sang bản tối ưu cho môi trường Production:
```powershell
npm run build
```
Khởi chạy bản Production cục bộ:
```powershell
npm run start
```

### 7. Hướng Dẫn Triển Khai (Deploy)

#### Triển khai lên Vercel (Khuyến nghị cho Next.js):
1. Đẩy mã nguồn lên GitHub.
2. Truy cập [Vercel](https://vercel.com/) và import repository.
3. Trong mục **Environment Variables**, thêm các biến `NEXT_PUBLIC_FIREBASE_*` từ file `.env.local`.
4. Nhấn **Deploy**.

#### Triển khai lên Firebase Hosting:
```powershell
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 📁 Cấu Trúc Thư Mục

```
src/
├── app/
│   ├── layout.tsx                # Root layout, ThemeProvider, AuthProvider, Toaster
│   ├── page.tsx                  # Điều hướng chính (/dashboard)
│   ├── (auth)/
│   │   ├── login/page.tsx        # Đăng nhập Google & Email & Demo 1 chạm
│   │   ├── register/page.tsx     # Đăng ký tài khoản
│   │   └── forgot-password/page.tsx # Khôi phục mật khẩu
│   └── (main)/
│       ├── layout.tsx            # Main layout có Sidebar desktop, BottomNav mobile & Shared Modals
│       ├── dashboard/page.tsx    # Dashboard chính (Big Date, Countdown, Timeline, Stats, Tomorrow)
│       ├── today/page.tsx        # Chế độ Sáng - Trưa - Chiều - Tối
│       ├── calendar/page.tsx     # Lịch FullCalendar (Tháng, Tuần, Ngày, Danh sách)
│       ├── tasks/page.tsx        # Danh sách công việc, checklist, overdue
│       ├── study/page.tsx        # Lịch học, nhập nhiều ngày 1 lần
│       ├── upcoming/page.tsx     # Sự kiện sắp tới (7 ngày, 30 ngày, deadline)
│       ├── statistics/page.tsx   # Thống kê hiệu suất & phân bổ thời gian
│       └── settings/page.tsx     # Cài đặt Theme, Notification, Múi giờ
├── components/
│   ├── layout/                   # Sidebar, BottomNav, Header, GlobalSearchModal
│   ├── dashboard/                # BigDateCard, UpcomingWidget, TodayTimeline, TomorrowWidget, StatsCards
│   ├── calendar/                 # CalendarView, EventModal
│   ├── tasks/                    # TaskCard, TaskModal
│   ├── study/                    # StudyModal
│   ├── quick-add/                # QuickAddModal
│   └── ui/                       # Button, Modal, ConfirmDialog, Badge, Skeleton, EmptyState
├── hooks/                        # useAuth, useEvents, useTasks, useTheme, useToast
├── lib/firebase/                 # config.ts
├── services/                     # authService, eventService, taskService, quickAddParser, demoData
├── types/                        # index.ts
└── utils/                        # dateUtils, categoryUtils
```
