# API Specification - Remi Backend

## Tổng quan

Tài liệu này mô tả các API endpoints cần thiết cho frontend application **remin**. Backend cần triển khai các API này để frontend có thể hoạt động đầy đủ.

**Base URL**: `http://localhost:3000/api`

**Content-Type**: `application/json` (trừ khi có ghi chú khác)

---

## 1. Memory Book Management

### 1.1. Tạo Memory Book mới

**Endpoint**: `POST /api/memory-books`

**Request Body**:
```json
{
  "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp",
  "type": "Lớp học"
}
```

**Request Schema**:
- `name` (string, required): Tên của memory book
- `type` (string, required): Loại memory book - một trong: `"Lớp học"`, `"Phòng ban"`, `"Nhóm"`

**Response 201 Created**:
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

**Response Schema**:
- `id` (string): ID chính của memory book (MongoDB ObjectId hoặc UUID)
- `name` (string): Tên memory book
- `type` (string): Loại memory book
- `pages` (array): Mảng rỗng ban đầu, sẽ chứa các PhotoPage
- `createdAt` (string): ISO 8601 date string
- `shareId` (string): ID công khai để share (có thể là hash ngắn, unique)
- `contributeId` (string): ID công khai để contribute (có thể là hash ngắn, unique)

---

### 1.2. Lấy danh sách Memory Books

**Endpoint**: `GET /api/memory-books`

**Query Parameters** (optional):
- `limit` (number, default: 20): Số lượng items mỗi page
- `offset` (number, default: 0): Số items bỏ qua

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp",
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

### 1.3. Lấy chi tiết Memory Book

**Endpoint**: `GET /api/memory-books/:id`

**Path Parameters**:
- `id` (string, required): ID của memory book

**Response 200 OK**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp",
  "type": "Lớp học",
  "pages": [
    {
      "id": "page1",
      "photos": [
        {
          "id": "photo1",
          "url": "/api/images/photo1.jpg",
          "note": "Ngày tốt nghiệp đáng nhớ",
          "prompt": "Khoảnh khắc này xảy ra khi…"
        }
      ],
      "layout": "single",
      "note": "Trang đầu tiên của nhật ký"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "shareId": "abc123xyz",
  "contributeId": "def456uvw"
}
```

**Error 404 Not Found**:
```json
{
  "error": {
    "code": "MEMORY_BOOK_NOT_FOUND",
    "message": "Không tìm thấy memory book"
  }
}
```

---

### 1.4. Cập nhật Memory Book

**Endpoint**: `PUT /api/memory-books/:id`

**Path Parameters**:
- `id` (string, required): ID của memory book

**Request Body** (tất cả fields đều optional):
```json
{
  "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp (Updated)",
  "type": "Lớp học",
  "pages": [
    {
      "id": "page1",
      "photos": [
        {
          "id": "photo1",
          "url": "/api/images/photo1.jpg",
          "note": "Ngày tốt nghiệp đáng nhớ",
          "prompt": "Khoảnh khắc này xảy ra khi…"
        }
      ],
      "layout": "single",
      "note": "Trang đầu tiên của nhật ký"
    }
  ]
}
```

**Response 200 OK**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp (Updated)",
  "type": "Lớp học",
  "pages": [...],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z",
  "shareId": "abc123xyz",
  "contributeId": "def456uvw"
}
```

**Lưu ý**: Khi cập nhật `pages`, frontend sẽ gửi toàn bộ array `pages` mới. Backend cần replace toàn bộ pages cũ bằng pages mới.

---

### 1.5. Xóa Memory Book

**Endpoint**: `DELETE /api/memory-books/:id`

**Path Parameters**:
- `id` (string, required): ID của memory book

**Response 200 OK**:
```json
{
  "message": "Memory book deleted successfully"
}
```

**Lưu ý**: Khi xóa memory book, cần xóa luôn tất cả ảnh liên quan trong thư mục uploads.

---

## 2. Photo Upload & Management

### 2.1. Upload ảnh

**Endpoint**: `POST /api/upload`

**Content-Type**: `multipart/form-data`

**Request Body**:
- `file` (File, required): File ảnh (image/jpeg, image/png, image/webp, etc.)
- `memoryBookId` (string, optional): ID của memory book nếu upload cho memory book cụ thể

**Response 200 OK**:
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

**Response Schema**:
- `id` (string): ID của photo
- `filename` (string): Tên file đã lưu trên server (nên hash để tránh trùng)
- `url` (string): URL để truy cập ảnh (relative path)
- `originalName` (string): Tên file gốc từ client
- `size` (number): Kích thước file tính bằng bytes
- `mimeType` (string): MIME type của file
- `uploadedAt` (string): ISO 8601 date string

**Validation**:
- Chỉ chấp nhận file ảnh: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Giới hạn kích thước: 10MB mỗi file
- Validate file extension

**Error 400 Bad Request**:
```json
{
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)"
  }
}
```

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File quá lớn. Kích thước tối đa: 10MB"
  }
}
```

---

### 2.2. Lấy ảnh

**Endpoint**: `GET /api/images/:filename`

**Path Parameters**:
- `filename` (string, required): Tên file ảnh

**Response 200 OK**:
- **Content-Type**: `image/jpeg` (hoặc `image/png`, `image/webp`, etc. tùy file)
- **Body**: Binary image data

**Error 404 Not Found**:
```json
{
  "error": {
    "code": "IMAGE_NOT_FOUND",
    "message": "Không tìm thấy ảnh"
  }
}
```

**Lưu ý**: 
- Serve static files từ thư mục `uploads/`
- Có thể implement image optimization/resizing nếu cần
- Có thể cache headers để tối ưu performance

---

### 2.3. Xóa ảnh

**Endpoint**: `DELETE /api/images/:filename`

**Path Parameters**:
- `filename` (string, required): Tên file ảnh

**Response 200 OK**:
```json
{
  "message": "Image deleted successfully"
}
```

**Error 404 Not Found**:
```json
{
  "error": {
    "code": "IMAGE_NOT_FOUND",
    "message": "Không tìm thấy ảnh"
  }
}
```

---

## 3. Public View & Share

### 3.1. Xem Memory Book công khai (qua shareId)

**Endpoint**: `GET /api/memory-books/share/:shareId`

**Path Parameters**:
- `shareId` (string, required): Share ID công khai của memory book

**Response 200 OK**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp",
  "type": "Lớp học",
  "pages": [
    {
      "id": "page1",
      "photos": [
        {
          "id": "photo1",
          "url": "/api/images/photo1.jpg",
          "note": "Ngày tốt nghiệp đáng nhớ",
          "prompt": "Khoảnh khắc này xảy ra khi…"
        }
      ],
      "layout": "single",
      "note": "Trang đầu tiên của nhật ký"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Lưu ý**: Endpoint này không yêu cầu authentication, ai có shareId đều có thể xem.

**Error 404 Not Found**:
```json
{
  "error": {
    "code": "SHARE_NOT_FOUND",
    "message": "Không tìm thấy memory book với share ID này"
  }
}
```

---

### 3.2. Lấy thông tin Memory Book để Contribute

**Endpoint**: `GET /api/memory-books/contribute/:contributeId`

**Path Parameters**:
- `contributeId` (string, required): Contribute ID công khai của memory book

**Response 200 OK**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp",
  "type": "Lớp học",
  "contributeId": "def456uvw"
}
```

**Lưu ý**: 
- Endpoint này chỉ trả về thông tin cơ bản, không trả về `pages` để tiết kiệm bandwidth
- Không yêu cầu authentication

**Error 404 Not Found**:
```json
{
  "error": {
    "code": "CONTRIBUTE_NOT_FOUND",
    "message": "Không tìm thấy memory book với contribute ID này"
  }
}
```

---

## 4. Contribution (Đóng góp ảnh)

### 4.1. Đóng góp ảnh cho Memory Book

**Endpoint**: `POST /api/memory-books/:id/contributions`

**Content-Type**: `multipart/form-data`

**Path Parameters**:
- `id` (string, required): ID của memory book

**Request Body**:
- `files` (File[], required): Mảng các file ảnh (tối đa 10 files)
- `notes` (string[], optional): Mảng các ghi chú tương ứng với từng ảnh
- `prompts` (string[], optional): Mảng các prompts tương ứng với từng ảnh

**Response 200 OK**:
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

**Validation**:
- Tối đa 10 files mỗi lần submit
- Validate file type và size giống như upload ảnh
- Nếu `notes` hoặc `prompts` được gửi, số lượng phải khớp với số files

**Error 400 Bad Request**:
```json
{
  "error": {
    "code": "TOO_MANY_FILES",
    "message": "Tối đa 10 ảnh mỗi lần đóng góp"
  }
}
```

---

### 4.2. Lấy danh sách Contributions

**Endpoint**: `GET /api/memory-books/:id/contributions`

**Path Parameters**:
- `id` (string, required): ID của memory book

**Query Parameters** (optional):
- `limit` (number, default: 50)
- `offset` (number, default: 0)

**Response 200 OK**:
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

## 5. Data Types

### PhotoPage Type

```typescript
{
  "id": string,                    // Unique ID của page
  "photos": Photo[],               // Mảng 1-4 photos
  "layout": PhotoLayout,           // Layout type
  "note": string                   // Ghi chú cho page
}
```

### PhotoLayout Type

Một trong các giá trị:
- `"single"` - 1 ảnh: full width
- `"two-horizontal"` - 2 ảnh: ngang (2 cột)
- `"two-vertical"` - 2 ảnh: dọc (2 hàng)
- `"three-left"` - 3 ảnh: 1 lớn trái, 2 nhỏ phải
- `"three-right"` - 3 ảnh: 2 nhỏ trái, 1 lớn phải
- `"three-top"` - 3 ảnh: 1 lớn trên, 2 nhỏ dưới
- `"three-bottom"` - 3 ảnh: 2 nhỏ trên, 1 lớn dưới
- `"four-grid"` - 4 ảnh: grid 2x2

### Photo Type

```typescript
{
  "id": string,                    // Unique ID của photo
  "url": string,                   // URL để load ảnh: /api/images/:filename
  "note": string,                  // Ghi chú của user (optional, có thể rỗng)
  "prompt": string                 // Prompt gợi ý (optional, có thể rỗng)
}
```

### MemoryBookType

Một trong các giá trị:
- `"Lớp học"`
- `"Phòng ban"`
- `"Nhóm"`

---

## 6. Error Handling

Tất cả các API trả về lỗi theo format chuẩn:

**Error Response Format**:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Message tiếng Việt mô tả lỗi",
    "details": {}  // Optional: chi tiết thêm về lỗi
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created (khi tạo resource mới)
- `400` - Bad Request (validation error, invalid input)
- `404` - Not Found (resource không tồn tại)
- `500` - Internal Server Error

### Error Codes

- `MEMORY_BOOK_NOT_FOUND` - Không tìm thấy memory book
- `SHARE_NOT_FOUND` - Không tìm thấy share ID
- `CONTRIBUTE_NOT_FOUND` - Không tìm thấy contribute ID
- `INVALID_FILE_TYPE` - File type không hợp lệ
- `FILE_TOO_LARGE` - File quá lớn
- `TOO_MANY_FILES` - Quá nhiều files
- `IMAGE_NOT_FOUND` - Không tìm thấy ảnh
- `VALIDATION_ERROR` - Lỗi validation input

---

## 7. CORS Configuration

Backend cần cấu hình CORS để cho phép frontend truy cập:

```typescript
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend dev URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Lưu ý**: Khi deploy production, cần cập nhật `origin` thành production URL của frontend.

---

## 8. Implementation Notes

### 8.1. File Upload

- **Storage**: Lưu file vào thư mục `uploads/` (local) hoặc cloud storage (S3, Cloudinary, etc.)
- **File Naming**: Nên hash filename để tránh trùng và bảo mật (ví dụ: `md5(timestamp + originalName)`)
- **File Validation**: 
  - Chỉ chấp nhận: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Giới hạn size: 10MB mỗi file
- **Security**: 
  - Sanitize filename
  - Validate file content (không chỉ dựa vào extension)
  - Rate limiting cho upload endpoint

### 8.2. IDs Management

- **id**: ID chính của memory book (MongoDB ObjectId hoặc UUID)
- **shareId**: ID công khai để share (có thể là hash ngắn, unique, ví dụ: 8-12 ký tự alphanumeric)
- **contributeId**: ID công khai để contribute (tương tự shareId, nhưng khác giá trị)

**Gợi ý**: Có thể generate shareId và contributeId bằng cách hash id + salt, hoặc random string unique.

### 8.3. Database Schema Suggestions

**MemoryBook Collection**:
```javascript
{
  _id: ObjectId,
  name: String,
  type: String,  // "Lớp học" | "Phòng ban" | "Nhóm"
  pages: [PhotoPage],
  shareId: String,      // Unique index
  contributeId: String, // Unique index
  createdAt: Date,
  updatedAt: Date
}
```

**Photo Collection** (optional - nếu cần lưu metadata riêng):
```javascript
{
  _id: ObjectId,
  filename: String,
  originalName: String,
  size: Number,
  mimeType: String,
  memoryBookId: ObjectId, // Optional
  uploadedAt: Date
}
```

**Contribution Collection**:
```javascript
{
  _id: ObjectId,
  memoryBookId: ObjectId,
  photoId: ObjectId,  // Reference to Photo
  note: String,
  prompt: String,
  contributedAt: Date
}
```

### 8.4. Performance Considerations

- **Pagination**: Implement pagination cho danh sách memory books và contributions
- **Image Optimization**: Có thể resize/compress ảnh khi upload để tiết kiệm storage
- **Caching**: Cache headers cho static images
- **Indexing**: Tạo indexes cho `shareId`, `contributeId`, `memoryBookId`

### 8.5. Security

- **Input Validation**: Validate và sanitize tất cả input
- **File Upload Security**: 
  - Validate file type và content
  - Scan malware nếu có thể
  - Limit file size
- **Rate Limiting**: Implement rate limiting cho upload và contribution endpoints
- **Authentication** (future): Hiện tại chưa cần, nhưng có thể thêm sau

---

## 9. Testing Checklist

Backend team nên test các scenarios sau:

- [ ] Tạo memory book mới thành công
- [ ] Lấy danh sách memory books với pagination
- [ ] Lấy chi tiết memory book
- [ ] Cập nhật memory book (name, type, pages)
- [ ] Xóa memory book
- [ ] Upload ảnh thành công
- [ ] Upload ảnh với file type không hợp lệ (reject)
- [ ] Upload ảnh quá lớn (reject)
- [ ] Lấy ảnh qua URL
- [ ] Xóa ảnh
- [ ] Xem memory book qua shareId
- [ ] Lấy thông tin memory book qua contributeId
- [ ] Đóng góp ảnh (1-10 files)
- [ ] Đóng góp quá 10 files (reject)
- [ ] Lấy danh sách contributions
- [ ] Error handling (404, 400, 500)
- [ ] CORS hoạt động đúng

---

## 10. Contact & Questions

Nếu có thắc mắc về API specification, vui lòng liên hệ frontend team.

**Frontend Repository**: `remin`  
**Backend Repository**: `remi-backend`

---

**Version**: 1.0  
**Last Updated**: 2024-01-15
