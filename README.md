# Remi Backend

Backend API server cho dự án Remi - Memory Book application.

## Tech Stack

- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database
- **Multer** - File upload
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

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/remi

# JWT Configuration (nếu cần authentication)
JWT_SECRET=your-secret-key-change-this-in-production

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

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
POST   /api/upload                # Upload ảnh
GET    /api/images/:filename      # Lấy ảnh
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
│   │   └── database.ts       # MongoDB connection
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
├── uploads/                  # Thư mục lưu ảnh
├── package.json
├── tsconfig.json
└── .env
```

## Development

### Kết nối với Frontend

Frontend (remin) chạy tại `http://localhost:5173` và sẽ gọi API từ backend tại `http://localhost:3000/api`.

CORS đã được cấu hình để cho phép frontend truy cập.

## Notes

- File upload được lưu local trong thư mục `uploads/`
- Có thể chuyển sang cloud storage (AWS S3, Cloudinary) sau
- MongoDB connection tự động reconnect khi disconnect
# remi-backend
