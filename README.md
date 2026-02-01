# Remi Backend

Backend API server cho dự án Remi - Memory Book application.

## Tech Stack

- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database
- **Multer** - File upload
- **Cloudinary** - Cloud image storage
- **CORS** - Cross-origin resource sharing

## Setup

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/remi

# JWT Configuration (nếu cần authentication)
JWT_SECRET=your-secret-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Lưu ý:** Bạn cần tạo tài khoản Cloudinary tại [cloudinary.com](https://cloudinary.com) và lấy các thông tin credentials từ dashboard.

### 3. Đảm bảo MongoDB đang chạy

```bash
# Nếu dùng MongoDB local
mongod

# Hoặc dùng MongoDB Atlas (cloud)
# Cập nhật MONGODB_URI trong .env
```

### 4. Chạy development server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Memory Books
```
GET    /api/memory-books          # Lấy danh sách memory books
GET    /api/memory-books/:id      # Lấy chi tiết memory book
POST   /api/memory-books          # Tạo memory book mới
PUT    /api/memory-books/:id      # Cập nhật memory book
DELETE /api/memory-books/:id      # Xóa memory book
```

### Upload
```
POST   /api/upload                # Upload ảnh (trả về Cloudinary URL)
GET    /api/images/:filename      # Lấy ảnh (deprecated - ảnh được serve trực tiếp từ Cloudinary)
DELETE /api/images/:filename      # Xóa ảnh từ Cloudinary
```

## Scripts

- `npm run dev` - Chạy development server với auto-reload
- `npm run build` - Build TypeScript sang JavaScript
- `npm start` - Chạy production server (sau khi build)
- `npm run type-check` - Kiểm tra TypeScript types

## Cấu trúc Project

```
remi-backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/
│   │   ├── database.ts       # MongoDB connection
│   │   └── cloudinary.ts     # Cloudinary configuration
│   ├── models/
│   │   └── MemoryBook.ts     # MemoryBook model
│   ├── routes/
│   │   ├── memoryBooks.ts    # MemoryBook routes
│   │   └── upload.ts         # Upload routes
│   ├── controllers/
│   │   ├── memoryBookController.ts
│   │   └── uploadController.ts
│   └── middleware/
│       └── errorHandler.ts   # Error handling
├── package.json
├── tsconfig.json
└── .env
```

## Development

### Kết nối với Frontend

Frontend (remin) chạy tại `http://localhost:5173` và sẽ gọi API từ backend tại `http://localhost:3000/api`.

CORS đã được cấu hình để cho phép frontend truy cập.

## Notes

- File upload được lưu trên **Cloudinary** (cloud storage)
- Ảnh được tự động optimize và transform khi upload
- MongoDB connection tự động reconnect khi disconnect
- URL trả về từ API là Cloudinary URL, có thể sử dụng trực tiếp trong frontend
# remi-backend
