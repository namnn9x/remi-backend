# Kiến trúc Dự án Remi

## Tổng quan

Dự án Remi được chia thành hai phần riêng biệt:

- **remin** - Frontend application (React + TypeScript + Vite)
- **remi-backend** - Backend API server

## Cấu trúc Dự án

```
Projects/
├── remin/              # Frontend Application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── types.ts       # TypeScript types
│   │   └── ...
│   ├── package.json
│   └── ...
│
└── remi-backend/       # Backend API Server
    ├── src/
    │   ├── routes/        # API routes
    │   ├── models/         # MongoDB models
    │   ├── controllers/    # Request handlers
    │   ├── middleware/     # Custom middleware
    │   └── index.ts        # Entry point
    ├── package.json
    └── .env
```

## Frontend - remin

### Công nghệ
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool và dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Routing

### Chức năng chính
Dựa trên cấu trúc hiện tại, frontend có các tính năng:
- Tạo Memory Book (sách kỷ niệm)
- Upload và quản lý ảnh
- Editor để chỉnh sửa trang
- Gallery để xem ảnh
- Preview và chia sẻ

### Port mặc định
- Development: `http://localhost:5173`

### Kết nối với Backend
Frontend sẽ gọi API thông qua:
- **Base URL**: `http://localhost:3000/api` (hoặc từ env variable)
- **Fetch API** hoặc **axios** (nếu cần)
- CORS đã được cấu hình ở backend

## Backend - remi-backend

### Tech Stack (Đơn giản, nhanh gọn)

#### Core (Bắt buộc)
- **Node.js** - Runtime environment
- **TypeScript** - Type safety
- **Express.js** - Web framework (đơn giản nhất)
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM (dễ dùng)

#### Utilities (Tối thiểu)
- **dotenv** - Environment variables
- **cors** - CORS middleware
- **multer** - File upload (cho ảnh)
- **jsonwebtoken** - JWT (nếu cần auth)
- **bcrypt** - Hash password (nếu cần auth)

#### Development Tools
- **nodemon** - Auto-reload
- **ts-node** - Chạy TypeScript trực tiếp
- **@types/express** - TypeScript types

### Cấu trúc Backend (Đơn giản)

```
remi-backend/
├── src/
│   ├── index.ts              # Entry point, setup Express
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/
│   │   ├── MemoryBook.ts     # MemoryBook model
│   │   └── Photo.ts          # Photo model (nếu cần)
│   ├── routes/
│   │   ├── memoryBooks.ts    # MemoryBook routes
│   │   └── upload.ts         # Upload routes
│   ├── controllers/
│   │   ├── memoryBookController.ts
│   │   └── uploadController.ts
│   └── middleware/
│       └── errorHandler.ts   # Error handling
├── uploads/                  # Thư mục lưu ảnh (local)
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
└── .gitignore
```

### API Endpoints (Dự kiến)

```
GET    /api/memory-books          # Lấy danh sách memory books
GET    /api/memory-books/:id      # Lấy chi tiết memory book
POST   /api/memory-books          # Tạo memory book mới
PUT    /api/memory-books/:id      # Cập nhật memory book
DELETE /api/memory-books/:id      # Xóa memory book

POST   /api/upload                # Upload ảnh
GET    /api/images/:filename      # Lấy ảnh
```

### Port mặc định
- Development: `http://localhost:3000`

### Kết nối với Frontend

#### 1. CORS Configuration
Backend sẽ cho phép frontend truy cập:
```typescript
// Cho phép frontend ở localhost:5173
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

#### 2. Environment Variables
```env
# Backend (.env)
PORT=3000
MONGODB_URI=mongodb://localhost:27017/remi
JWT_SECRET=your-secret-key (nếu cần)
UPLOAD_DIR=./uploads
```

#### 3. Frontend API Client
Tạo file `src/api/client.ts` trong frontend:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  get: (endpoint: string) => fetch(`${API_BASE_URL}${endpoint}`),
  post: (endpoint: string, data: any) => 
    fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  // ... các methods khác
};
```

## Luồng hoạt động

```
┌─────────────┐         HTTP/REST API         ┌──────────────┐
│             │ ────────────────────────────> │              │
│   Frontend  │   GET /api/memory-books       │    Backend   │
│   (remin)   │                               │ (remi-backend)│
│             │ <──────────────────────────── │              │
│             │   { data: [...] }            │              │
└─────────────┘                               └──────────────┘
                                              │
                                              ▼
                                        ┌──────────┐
                                        │ MongoDB  │
                                        └──────────┘
```

1. User tương tác với Frontend (remin)
2. Frontend gửi HTTP request đến Backend API (`http://localhost:3000/api/...`)
3. Backend xử lý request, tương tác với MongoDB
4. Backend trả về JSON response
5. Frontend cập nhật UI dựa trên response

## Development Workflow

### Chạy Frontend
```bash
cd remin
npm install
npm run dev
# Chạy tại http://localhost:5173
```

### Chạy Backend
```bash
cd remi-backend
npm install
npm run dev
# Chạy tại http://localhost:3000
```

### Chạy cả hai
Cần chạy cả frontend và backend đồng thời:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

### Package.json Scripts (Backend)
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## Lưu ý quan trọng

1. **Tách biệt**: Frontend và Backend là hai dự án độc lập, có thể deploy riêng biệt
2. **API Communication**: Frontend và Backend giao tiếp qua HTTP/HTTPS
3. **CORS**: Backend đã cấu hình CORS để cho phép frontend truy cập
4. **File Upload**: Ảnh được lưu local trong thư mục `uploads/` (có thể chuyển sang cloud storage sau)
5. **Environment Variables**: Sử dụng `.env` cho cấu hình, không commit vào git

## Các bước setup

### Backend Setup
1. [x] Tạo cấu trúc thư mục cơ bản
2. [ ] Khởi tạo package.json với dependencies
3. [ ] Setup Express server cơ bản
4. [ ] Kết nối MongoDB với Mongoose
5. [ ] Tạo models (MemoryBook, Photo)
6. [ ] Tạo routes và controllers
7. [ ] Cấu hình CORS
8. [ ] Setup file upload với multer
9. [ ] Error handling middleware
10. [ ] Environment variables (.env)

### Frontend Integration
1. [ ] Tạo API client trong frontend
2. [ ] Cấu hình environment variable cho API URL
3. [ ] Tích hợp API calls vào các components
4. [ ] Error handling cho API calls

## Tech Stack Summary

### Backend (Minimal & Simple)
```
✅ Node.js + TypeScript
✅ Express.js (framework đơn giản nhất)
✅ MongoDB + Mongoose (dễ dùng)
✅ dotenv (env variables)
✅ cors (CORS)
✅ multer (file upload)
✅ nodemon + ts-node (dev tools)
```

**Không dùng** (để đơn giản):
- ❌ NestJS (quá phức tạp cho 1 người)
- ❌ Prisma (Mongoose đơn giản hơn)
- ❌ GraphQL (REST đủ dùng)
- ❌ Redis (chưa cần)
- ❌ Docker (chưa cần, setup sau)
