# Prompt: Tích hợp Authentication vào Frontend Remi

## Yêu cầu

Tích hợp hệ thống authentication (đăng ký/đăng nhập) vào frontend Remi application. Backend đã triển khai đầy đủ các API endpoints và cần frontend tích hợp để:

1. Cho phép user đăng ký tài khoản mới
2. Cho phép user đăng nhập
3. Lưu trữ và quản lý JWT token
4. Tự động gửi token trong các API requests cần authentication
5. Xử lý logout và clear token
6. Bảo vệ các routes/pages cần authentication
7. Hiển thị thông tin user hiện tại

## Backend API Endpoints

**Base URL**: `http://localhost:3000/api` (hoặc từ env variable `VITE_API_URL`)

### 1. Đăng ký (Register)

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Validation Rules**:
- `email`: Required, phải là email hợp lệ
- `password`: Required, tối thiểu 6 ký tự
- `name`: Required, không được rỗng

**Success Response (201)**:
```json
{
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "User Name"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 VALIDATION_ERROR`: "Email, password và name là bắt buộc" hoặc "Mật khẩu phải có ít nhất 6 ký tự"
- `409 USER_EXISTS`: "Email đã được sử dụng"

### 2. Đăng nhập (Login)

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation Rules**:
- `email`: Required
- `password`: Required

**Success Response (200)**:
```json
{
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "User Name"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 VALIDATION_ERROR`: "Email và password là bắt buộc"
- `401 INVALID_CREDENTIALS`: "Email hoặc mật khẩu không đúng"

### 3. Lấy thông tin user hiện tại (Get Current User)

**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Error Responses**:
- `401 UNAUTHORIZED`: "Không có token xác thực"
- `401 INVALID_TOKEN`: "Token không hợp lệ hoặc đã hết hạn"
- `401 USER_NOT_FOUND`: "Người dùng không tồn tại"

## Error Response Format

Tất cả lỗi từ backend trả về theo format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Message tiếng Việt mô tả lỗi"
  }
}
```

## Các thay đổi cần thực hiện

### 1. Tạo API Client cho Authentication

Tạo file `src/api/auth.ts` (hoặc tương tự) với các functions:

```typescript
// Types
interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// API functions
export const register = async (data: RegisterData): Promise<AuthResponse>
export const login = async (data: LoginData): Promise<AuthResponse>
export const getCurrentUser = async (): Promise<User>
```

**Lưu ý**:
- Sử dụng base URL từ environment variable: `import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`
- Tất cả requests cần `Content-Type: application/json`
- Function `getCurrentUser` cần gửi token trong header `Authorization: Bearer <token>`

### 2. Token Management

Tạo utility để quản lý token:

**File**: `src/utils/auth.ts` (hoặc tương tự)

```typescript
// Lưu token vào localStorage
export const saveToken = (token: string): void

// Lấy token từ localStorage
export const getToken = (): string | null

// Xóa token khỏi localStorage
export const removeToken = (): void

// Kiểm tra có token không
export const isAuthenticated = (): boolean
```

**Lưu ý**: 
- Lưu token vào `localStorage` với key `auth_token` (hoặc tên khác phù hợp)
- Token có thời hạn 7 ngày (backend config)

### 3. Auth Context/Store

Tạo Auth Context (React Context) hoặc Store (Zustand/Pinia) để quản lý:

- User state (current user info)
- Authentication state (isAuthenticated)
- Loading state
- Error state

**Functions cần có**:
- `register(email, password, name)`: Đăng ký và tự động login
- `login(email, password)`: Đăng nhập
- `logout()`: Đăng xuất, clear token và user state
- `fetchCurrentUser()`: Lấy thông tin user hiện tại (dùng khi app load để check auth)
- `clearError()`: Clear error state

**State structure**:
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### 4. Protected Routes

Bảo vệ các routes/pages cần authentication:

- Tạo `ProtectedRoute` component hoặc sử dụng route guard
- Nếu chưa đăng nhập, redirect đến trang login
- Nếu đã đăng nhập nhưng token hết hạn, tự động logout và redirect

**Routes cần bảo vệ**:
- `/memory-books` (danh sách memory books)
- `/memory-books/create` (tạo memory book mới)
- `/memory-books/:id` (chi tiết memory book)
- Các routes khác liên quan đến quản lý memory books

**Routes public** (không cần auth):
- `/login` (trang đăng nhập)
- `/register` (trang đăng ký)
- `/memory-books/share/:shareId` (xem memory book qua share link)
- `/memory-books/contribute/:contributeId` (contribute page)

### 5. API Client Interceptor

Cập nhật API client để tự động thêm token vào headers:

**File**: `src/api/client.ts` (hoặc tương tự)

- Tất cả requests (trừ login/register) cần tự động thêm header:
  ```
  Authorization: Bearer <token>
  ```
- Nếu token không có hoặc hết hạn, tự động logout và redirect đến login
- Xử lý 401 errors: clear token và redirect đến login

### 6. UI Components

Tạo các UI components:

**Login Page** (`src/pages/Login.tsx` hoặc tương tự):
- Form với email và password
- Validation (email format, password required)
- Hiển thị error messages
- Link đến trang đăng ký
- Submit button với loading state

**Register Page** (`src/pages/Register.tsx` hoặc tương tự):
- Form với email, password, và name
- Validation (email format, password min 6 chars, name required)
- Hiển thị error messages
- Link đến trang đăng nhập
- Submit button với loading state

**User Menu/Dropdown** (nếu có):
- Hiển thị tên user
- Logout button

### 7. Auto-fetch User on App Load

Khi app khởi động:

1. Kiểm tra có token trong localStorage không
2. Nếu có token:
   - Gọi `getCurrentUser()` để lấy thông tin user
   - Nếu thành công: set user state, set isAuthenticated = true
   - Nếu thất bại (401): clear token, redirect đến login
3. Nếu không có token: giữ isAuthenticated = false

### 8. Cập nhật Memory Books API Calls

Tất cả API calls đến `/api/memory-books` (trừ share/contribute) cần:
- Tự động thêm Authorization header với token
- Xử lý 401 errors (token hết hạn) bằng cách logout và redirect

## Error Handling

Xử lý các error codes từ backend:

- `VALIDATION_ERROR`: Hiển thị message lỗi validation cho user
- `USER_EXISTS`: Hiển thị "Email đã được sử dụng" ở form đăng ký
- `INVALID_CREDENTIALS`: Hiển thị "Email hoặc mật khẩu không đúng" ở form đăng nhập
- `UNAUTHORIZED`, `INVALID_TOKEN`, `USER_NOT_FOUND`: Tự động logout và redirect đến login

## Environment Variables

Thêm vào `.env` (nếu chưa có):

```env
VITE_API_URL=http://localhost:3000/api
```

## Testing Checklist

Sau khi implement, test các scenarios:

- [ ] Đăng ký thành công → tự động login và redirect
- [ ] Đăng ký với email đã tồn tại → hiển thị error
- [ ] Đăng nhập thành công → lưu token và redirect
- [ ] Đăng nhập với credentials sai → hiển thị error
- [ ] Truy cập protected route khi chưa login → redirect đến login
- [ ] Truy cập protected route khi đã login → cho phép truy cập
- [ ] Logout → clear token và redirect đến login
- [ ] Refresh page khi đã login → vẫn giữ authentication state
- [ ] Token hết hạn → tự động logout và redirect
- [ ] API calls tự động thêm Authorization header

## Lưu ý quan trọng

1. **Token Storage**: Lưu token trong `localStorage` (không phải sessionStorage) để giữ login khi refresh page
2. **Security**: Không log token ra console trong production
3. **Error Messages**: Hiển thị error messages bằng tiếng Việt (từ backend)
4. **Loading States**: Hiển thị loading indicator khi đang gọi API
5. **Form Validation**: Validate form ở client-side trước khi gửi request
6. **Auto-logout**: Tự động logout khi nhận 401 từ bất kỳ API nào
7. **Token Expiry**: Backend token expires sau 7 ngày, frontend cần handle khi token hết hạn

## API Response Examples

### Success Response Structure

Tất cả success responses từ auth APIs có structure:
```json
{
  "message": "string",  // Optional
  "data": {
    "user": { ... },
    "token": "string"   // Chỉ có trong register/login
  }
}
```

### Error Response Structure

Tất cả error responses:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Message tiếng Việt"
  }
}
```

## Integration với Memory Books API

Sau khi implement auth, tất cả calls đến Memory Books API cần:

1. **GET /api/memory-books**: Cần token, trả về chỉ memory books của user hiện tại
2. **POST /api/memory-books**: Cần token, tự động gán userId
3. **GET /api/memory-books/:id**: Cần token, chỉ trả về nếu user là owner
4. **PUT /api/memory-books/:id**: Cần token, chỉ update được nếu user là owner
5. **DELETE /api/memory-books/:id**: Cần token, chỉ delete được nếu user là owner

**Public routes** (không cần token):
- `GET /api/memory-books/share/:shareId`
- `GET /api/memory-books/contribute/:contributeId`
