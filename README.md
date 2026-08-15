# 🎣 Chí Toàn Fishing Shop - Trang web Đồ câu Chí Toàn

Trang web thương mại điện tử chuyên nghiệp, tải nhanh và tối ưu hóa trải nghiệm mua sắm cho **Chí Toàn Fishing Shop** (chuyên cung cấp mồi câu, lưỡi câu và phụ kiện câu cá). Dự án được phát triển dựa trên Next.js 16, React 19, Tailwind CSS v4 và được tối ưu hóa để chạy hoàn toàn Serverless/Static Export trên **GitHub Pages** hoặc Tên miền riêng (Custom Domain).

---

## ✨ Điểm nổi bật của dự án

### ⚡ 1. Kiến trúc Serverless & Flat-file Database

- Không cần cơ sở dữ liệu (MySQL, MongoDB) hay server backend phức tạp. Toàn bộ dữ liệu sản phẩm, danh mục và cấu hình menu được lưu trữ trực tiếp trong tệp tin local [store.json](file:///d:/Documents/GitHub/shopdocauchitoanfishing/data/store.json).
- Sử dụng cơ chế Static Export (`output: "export"`) của Next.js giúp trang web được đóng gói thành các trang tĩnh HTML/CSS/JS thuần túy. Tải trang cực kỳ nhanh và hoạt động mượt mà 100% không tốn chi phí thuê máy chủ.

### 📝 2. Hệ quản trị Git-based CMS (Decoupled Admin Dashboard)

- Tích hợp trang quản trị trực quan tại `/admin` cho phép thêm, sửa, xóa sản phẩm và danh mục trực tiếp trên trình duyệt.
- Thay vì ghi vào cơ sở dữ liệu truyền thống, hệ thống sử dụng **GitHub API** (kết nối qua GitHub Personal Access Token) để tự động hóa quy trình:
  1. Đóng gói tất cả các thay đổi dữ liệu (`store.json`) và tệp tin hình ảnh mới tải lên.
  2. Tạo mã Git Blobs, Trees, và tạo một commit duy nhất (**Batch Commit**) đẩy thẳng lên kho lưu trữ GitHub của bạn.
  3. Kích hoạt GitHub Actions tự động build và cập nhật phiên bản mới lên GitHub Pages.

### 💳 3. Quy trình Thanh toán tối ưu & VietQR Động

- **VietQR Động**: Tự động sinh mã QR thanh toán ngân hàng (Vietcombank - Chủ tài khoản: TRẦN MINH PHÚ) theo từng đơn hàng với số tiền chính xác và nội dung chuyển khoản tự động (`CTF[Timestamp][Random]`).
- **Tích hợp Chatbot Messenger**: Thông tin đơn hàng sau khi hoàn tất thanh toán sẽ được biên soạn gọn gàng và tự động sao chép vào bộ nhớ tạm (clipboard) của khách hàng, sau đó chuyển hướng khách hàng sang Facebook Messenger của shop để dán gửi đơn hàng và xác nhận nhanh chóng.
- **Thông báo Telegram**: Hệ thống hỗ trợ tích hợp gửi thông báo chi tiết đơn hàng trực tiếp tới Telegram Bot của chủ shop (`NEXT_PUBLIC_TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_CHAT_ID`).
- **Quản lý địa chỉ**: Hỗ trợ lưu trữ nhiều hồ sơ địa chỉ giao hàng của khách hàng dưới `localStorage` để tiện sử dụng cho những lần mua sắm tiếp theo.

### 🕷️ 4. Bộ công cụ cào Shopee (Scraper Tool)

- Tích hợp công cụ cào dữ liệu [scrape-and-import.js](file:///d:/Documents/GitHub/shopdocauchitoanfishing/scripts/scrape-and-import.js) giúp nhanh chóng đồng bộ hóa sản phẩm từ gian hàng Shopee của shop sang trang web tĩnh:
  - Tự động phân tích cấu trúc trang Shopee đã lưu (`test.html`).
  - Tải toàn bộ hình ảnh sản phẩm từ Shopee CDN về thư mục dự án để tự lưu trữ.
  - Chuẩn hóa tiêu đề tiếng Việt thành link slug (không dấu, dạng `-`), tự động phân loại thuộc tính kích cỡ, trọng lượng, cấu hình các tùy chọn và tự sinh khoảng giá.

---

## 📂 Cấu trúc thư mục

```text
├── app/                  # Next.js App Router (trang chính, tìm kiếm, admin, thanh toán, liên hệ,...)
├── components/           # Các component giao diện UI (giỏ hàng, thanh toán, quản lý admin,...)
├── data/                 # Cơ sở dữ liệu dạng file (store.json chứa danh sách sản phẩm & danh mục)
├── docs/                 # Thư mục chứa mã nguồn tĩnh sau khi build (Dùng để deploy lên GitHub Pages)
├── lib/                  # Thư viện dùng chung (cấu hình GitHub sync, site-config, constants, types...)
├── public/               # Thư mục tài nguyên tĩnh (hình ảnh sản phẩm, fonts, logo,...)
├── scripts/              # Các kịch bản build, cào Shopee, cấu hình môi trường...
├── next.config.ts        # Cấu hình Next.js (output: export, basePath...)
└── package.json          # Các thư viện phụ thuộc và scripts khởi chạy dự án
```

---

## 🚀 Hướng dẫn khởi chạy dưới local

### Yêu cầu hệ thống

- Đã cài đặt **Node.js** (Khuyên dùng v18 trở lên).
- Trình quản lý gói **pnpm** (hoặc `npm`/`yarn`).

### Các bước thực hiện:

1. Clone dự án và di chuyển vào thư mục:

   ```bash
   git clone <link-repo-cua-ban>
   cd shopdocauchitoanfishing
   ```

2. Cài đặt các thư viện phụ thuộc:

   ```bash
   pnpm install
   ```

3. Khởi chạy môi trường phát triển (Local Development):
   ```bash
   pnpm dev
   ```
   Trang web sẽ chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Quy trình Build & Deploy lên GitHub Pages

Trang web hỗ trợ hai chế độ triển khai (được quản lý thông qua biến môi trường `NEXT_PUBLIC_BASE_PATH` trong file `.env.local`):

- **GitHub Pages**: Trang web chạy dưới đường dẫn con `/shopdocauchitoanfishing`.
- **Tên miền riêng (Custom Domain)**: Trang web chạy dưới thư mục gốc đại diện cho tên miền riêng của bạn.

### Bước 1: Chọn chế độ deploy

Bạn sử dụng script tiện ích được thiết lập sẵn để chuyển đổi nhanh chế độ:

- Nếu deploy lên **GitHub Pages**:
  ```bash
  pnpm mode:gh-pages
  ```
- Nếu deploy lên **Tên miền riêng**:
  ```bash
  pnpm mode:domain
  ```

### Bước 2: Biên dịch và Đóng gói

Sau khi chọn chế độ phù hợp, chạy lệnh build tương ứng:

- Biên dịch cho **GitHub Pages**:
  ```bash
  pnpm build:gh-pages
  ```
- Biên dịch cho **Tên miền riêng**:
  ```bash
  pnpm build:domain
  ```

> 📌 **Lưu ý hoạt động**: Sau khi Next.js xuất bản trang tĩnh ra thư mục `/out`, script `scripts/postbuild.mjs` sẽ tự động chạy để dọn dẹp, sao chép toàn bộ nội dung từ `/out` sang `/docs`, đồng thời tạo file `.nojekyll` giúp GitHub Pages nhận diện thư mục static chính xác. Bạn chỉ cần commit thư mục `/docs` lên GitHub và cấu hình GitHub Pages chạy từ thư mục `/docs` của nhánh chính.

---

## ⚙️ Hướng dẫn cấu hình Admin (Đồng bộ GitHub)

Để trang quản trị `/admin` có thể lưu sản phẩm và hình ảnh mới trực tiếp lên GitHub từ giao diện web, bạn cần thiết lập cấu hình kết nối:

1. Truy cập vào trang web của bạn dưới đường dẫn `/admin` (Ví dụ: `https://yourdomain.com/admin` hoặc `http://localhost:3000/admin`).
2. Nhấp vào nút cấu hình GitHub trên giao diện Admin Dashboard và nhập đầy đủ thông tin:
   - **GitHub Owner (Tên tài khoản GitHub)**: ví dụ `tranminhphu7425`
   - **Repository Name (Tên kho chứa)**: `shopdocauchitoanfishing`
   - **Branch (Nhánh đồng bộ)**: mặc định là `main`
   - **GitHub Personal Access Token (Mã kết nối)**: Token này cần có quyền ghi (`write` hoặc `repo`) để có thể ghi đè file. Bạn có thể tạo token này tại tài khoản GitHub cá nhân của mình.
3. Nhấp **Lưu cấu hình**. Hệ thống sẽ tự động kiểm tra kết nối và hiển thị trạng thái kích hoạt đồng bộ hóa dữ liệu.

---

## 🕷️ Hướng dẫn sử dụng công cụ cào sản phẩm Shopee

Bạn có thể cào nhanh hàng loạt sản phẩm từ gian hàng Shopee của mình chỉ với vài thao tác đơn giản:

1. Truy cập vào trang tìm kiếm sản phẩm trên gian hàng Shopee của shop trên trình duyệt máy tính.
2. Nhấp chuột phải chọn **Save as...** (Lưu dưới dạng...) và lưu trang web với tên là `test.html` đặt ngay tại thư mục gốc của dự án `shopdocauchitoanfishing/`.
3. Chạy lệnh cào và import tự động:
   ```bash
   node scripts/scrape-and-import.js
   ```
4. Kịch bản sẽ tự động phân tích dữ liệu, tải ảnh sản phẩm từ Shopee CDN lưu vào `public/images/products` và đồng bộ danh sách sản phẩm mới vào `data/store.json`.

---

## 📞 Thông tin liên hệ cửa hàng

- **Tên cửa hàng**: CHÍ TOÀN FISHING SHOP
- **Điện thoại / Zalo**: 0348667831
- **TikTok**: [@chi*toan_fishing*](https://www.tiktok.com/@chi_toan_fishing_)
- **Shopee**: [Shop Đồ Câu Chí Toàn](https://shopee.vn/shopdocauchitoanfishing)
- **Facebook Messenger**: [chiToan434](https://m.me/chiToan434)
