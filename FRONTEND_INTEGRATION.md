# API Integration Guide - Remi Backend

**Base URL**: `http://localhost:3000/api`

---

## 1. Memory Book Management

### POST `/api/memory-books`
**Tác dụng**: Tạo memory book mới

**Input**:
```json
{
  "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp",
  "type": "Lớp học"  // "Lớp học" | "Phòng ban" | "Nhóm"
}
```

**Output** (201):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp",
  "type": "Lớp học",
  "pages": [],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "shareId": "abc123xyz",
  "contributeId": "def456uvw"
}
```

---

### GET `/api/memory-books`
**Tác dụng**: Lấy danh sách memory books (có pagination)

**Input** (Query params):
- `limit` (optional, default: 20): Số lượng items
- `offset` (optional, default: 0): Số items bỏ qua

**Output** (200):
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Lớp 12A1",
      "type": "Lớp học",
      "pages": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "shareId": "abc123xyz",
      "contributeId": "def456uvw"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### GET `/api/memory-books/:id`
**Tác dụng**: Lấy chi tiết memory book theo ID

**Input**: ID trong URL path

**Output** (200):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lớp 12A1",
  "type": "Lớp học",
  "pages": [
    {
      "id": "page1",
      "photos": [
        {
          "id": "photo1",
          "url": "/api/images/photo1.jpg",
          "note": "Ngày tốt nghiệp",
          "prompt": "Khoảnh khắc này xảy ra khi…"
        }
      ],
      "layout": "single",
      "note": "Trang đầu tiên"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "shareId": "abc123xyz",
  "contributeId": "def456uvw"
}
```

---

### PUT `/api/memory-books/:id`
**Tác dụng**: Cập nhật memory book

**Input** (Body - tất cả fields optional):
```json
{
  "name": "Lớp 12A1 (Updated)",
  "type": "Lớp học",
  "pages": [
    {
      "id": "page1",
      "photos": [
        {
          "id": "photo1",
          "url": "/api/images/photo1.jpg",
          "note": "Ghi chú",
          "prompt": "Prompt"
        }
      ],
      "layout": "single",
      "note": "Note cho page"
    }
  ]
}
```

**Output** (200): Giống GET `/api/memory-books/:id` + `updatedAt`

---

### DELETE `/api/memory-books/:id`
**Tác dụng**: Xóa memory book và tất cả ảnh liên quan

**Input**: ID trong URL path

**Output** (200):
```json
{
  "message": "Memory book deleted successfully"
}
```

---

## 2. Photo Upload & Management

### POST `/api/upload`
**Tác dụng**: Upload một ảnh lên server

**Input** (multipart/form-data):
- `file` (File, required): File ảnh
- `memoryBookId` (string, optional): ID của memory book

**Output** (200):
```json
{
  "id": "photo123",
  "filename": "abc123def456.jpg",
  "url": "/api/images/abc123def456.jpg",
  "originalName": "my-photo.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg",
  "uploadedAt": "2024-01-15T10:30:00.000Z"
}
```

**Lưu ý**: 
- Chỉ chấp nhận: JPEG, PNG, WebP, GIF
- Tối đa: 10MB

---

### GET `/api/images/:filename`
**Tác dụng**: Lấy ảnh theo tên file

**Input**: filename trong URL path

**Output** (200): Binary image data (Content-Type: image/jpeg, image/png, etc.)

---

### DELETE `/api/images/:filename`
**Tác dụng**: Xóa ảnh

**Input**: filename trong URL path

**Output** (200):
```json
{
  "message": "Image deleted successfully"
}
```

---

## 3. Public View & Share

### GET `/api/memory-books/share/:shareId`
**Tác dụng**: Xem memory book công khai (không cần auth)

**Input**: shareId trong URL path

**Output** (200): Giống GET `/api/memory-books/:id` (nhưng không có shareId, contributeId trong response)

---

### GET `/api/memory-books/contribute/:contributeId`
**Tác dụng**: Lấy thông tin cơ bản của memory book để contribute (không có pages)

**Input**: contributeId trong URL path

**Output** (200):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lớp 12A1",
  "type": "Lớp học",
  "contributeId": "def456uvw"
}
```

---

## 4. Contribution (Đóng góp ảnh)

### POST `/api/memory-books/:id/contributions`
**Tác dụng**: Đóng góp nhiều ảnh cho memory book (tối đa 10 ảnh)

**Input** (multipart/form-data):
- `files` (File[], required): Mảng các file ảnh (tối đa 10)
- `notes` (string[], optional): Mảng ghi chú tương ứng
- `prompts` (string[], optional): Mảng prompts tương ứng

**Output** (200):
```json
{
  "message": "Contributions submitted successfully",
  "contributions": [
    {
      "id": "contrib1",
      "photoId": "photo123",
      "url": "/api/images/abc123def456.jpg",
      "note": "Khoảnh khắc đẹp",
      "prompt": "Khoảnh khắc này xảy ra khi…",
      "contributedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Lưu ý**: 
- Tối đa 10 files
- Nếu có notes/prompts, số lượng phải khớp với số files

---

### GET `/api/memory-books/:id/contributions`
**Tác dụng**: Lấy danh sách contributions của memory book

**Input** (Query params):
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Output** (200):
```json
{
  "data": [
    {
      "id": "contrib1",
      "photoId": "photo123",
      "url": "/api/images/abc123def456.jpg",
      "note": "Khoảnh khắc đẹp",
      "prompt": "Khoảnh khắc này xảy ra khi…",
      "contributedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

## 5. Error Response Format

Tất cả lỗi trả về theo format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Message tiếng Việt mô tả lỗi"
  }
}
```

**Các Error Codes**:
- `MEMORY_BOOK_NOT_FOUND` - Không tìm thấy memory book
- `SHARE_NOT_FOUND` - Không tìm thấy share ID
- `CONTRIBUTE_NOT_FOUND` - Không tìm thấy contribute ID
- `INVALID_FILE_TYPE` - File type không hợp lệ
- `FILE_TOO_LARGE` - File quá lớn (>10MB)
- `TOO_MANY_FILES` - Quá nhiều files (>10)
- `IMAGE_NOT_FOUND` - Không tìm thấy ảnh
- `VALIDATION_ERROR` - Lỗi validation input

**HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## 6. Data Types

### PhotoLayout
- `"single"` - 1 ảnh full width
- `"two-horizontal"` - 2 ảnh ngang
- `"two-vertical"` - 2 ảnh dọc
- `"three-left"` - 3 ảnh: 1 lớn trái, 2 nhỏ phải
- `"three-right"` - 3 ảnh: 2 nhỏ trái, 1 lớn phải
- `"three-top"` - 3 ảnh: 1 lớn trên, 2 nhỏ dưới
- `"three-bottom"` - 3 ảnh: 2 nhỏ trên, 1 lớn dưới
- `"four-grid"` - 4 ảnh grid 2x2

### MemoryBookType
- `"Lớp học"`
- `"Phòng ban"`
- `"Nhóm"`

---

## 7. CORS Configuration

Backend đã cấu hình CORS cho frontend tại `http://localhost:5173`.

Khi deploy production, cần cập nhật `FRONTEND_URL` trong `.env` của backend.
