# Tính năng: Xem Memory Books của tôi và Memory Books đã đóng góp

## Tổng quan

Tính năng này cho phép user xem:
1. **Memory Books mà họ tạo** (nơi họ là leader/người tạo)
2. **Memory Books mà họ đã đóng góp** (đã submit contributions)

## Thay đổi trong API

### 1. MemoryBook Model - Thêm field `isLeader`

Khi tạo MemoryBook mới, user tạo sẽ tự động được set `isLeader: true`.

**Response format mới** - Tất cả endpoints trả về MemoryBook đều có thêm field `isLeader`:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lớp 12A1",
  "type": "Lớp học",
  "pages": [...],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "shareId": "abc123xyz",
  "contributeId": "def456uvw",
  "isLeader": true  // ← Field mới
}
```

### 2. Contribution Model - Thêm field `userId`

Mỗi contribution giờ đã track `userId` của người đóng góp để có thể query MemoryBooks mà user đã contribute.

---

## Endpoint mới: GET `/api/memory-books/my`

### Mô tả
Lấy danh sách MemoryBooks của user, bao gồm:
- MemoryBooks mà user là leader (đã tạo)
- MemoryBooks mà user đã đóng góp (đã submit contributions)

### Authentication
**Required**: Cần authentication token trong header
```
Authorization: Bearer <token>
```

### Query Parameters
- `limit` (optional, default: 20): Số lượng items mỗi loại
- `offset` (optional, default: 0): Số items bỏ qua

### Response Format (200)

```json
{
  "data": {
    "myBooks": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Lớp 12A1 - Kỷ niệm tốt nghiệp",
        "type": "Lớp học",
        "pages": [...],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "shareId": "abc123xyz",
        "contributeId": "def456uvw",
        "isLeader": true
      }
    ],
    "contributedBooks": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Lớp 10B2 - Chuyến đi dã ngoại",
        "type": "Lớp học",
        "pages": [...],
        "createdAt": "2024-01-14T09:00:00.000Z",
        "updatedAt": "2024-01-14T09:00:00.000Z",
        "shareId": "xyz789abc",
        "contributeId": "uvw456def",
        "isLeader": false
      }
    ]
  },
  "total": {
    "myBooks": 5,
    "contributedBooks": 3
  },
  "limit": 20,
  "offset": 0
}
```

### Response Fields

#### `data.myBooks`
- Array các MemoryBooks mà user đã tạo (isLeader = true)
- Sắp xếp theo `createdAt` giảm dần (mới nhất trước)

#### `data.contributedBooks`
- Array các MemoryBooks mà user đã đóng góp (đã submit contributions)
- **Không bao gồm** MemoryBooks mà user là leader (tránh trùng lặp)
- Sắp xếp theo `createdAt` giảm dần

#### `total`
- `total.myBooks`: Tổng số MemoryBooks mà user là leader
- `total.contributedBooks`: Tổng số MemoryBooks mà user đã contribute (không tính những cái user là leader)

### Error Responses

#### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

---

## Ví dụ sử dụng

### JavaScript/TypeScript với fetch

```typescript
// Lấy MemoryBooks của tôi
async function getMyMemoryBooks(limit = 20, offset = 0) {
  const token = localStorage.getItem('authToken'); // Hoặc cách lưu token của bạn
  
  const response = await fetch(
    `http://localhost:3000/api/memory-books/my?limit=${limit}&offset=${offset}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch memory books');
  }

  return await response.json();
}

// Sử dụng
try {
  const result = await getMyMemoryBooks(20, 0);
  console.log('My Books:', result.data.myBooks);
  console.log('Contributed Books:', result.data.contributedBooks);
  console.log('Total my books:', result.total.myBooks);
  console.log('Total contributed:', result.total.contributedBooks);
} catch (error) {
  console.error('Error:', error);
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface MemoryBook {
  id: string;
  name: string;
  type: string;
  pages: any[];
  createdAt: string;
  updatedAt: string;
  shareId: string;
  contributeId: string;
  isLeader: boolean;
}

interface MyMemoryBooksResponse {
  data: {
    myBooks: MemoryBook[];
    contributedBooks: MemoryBook[];
  };
  total: {
    myBooks: number;
    contributedBooks: number;
  };
  limit: number;
  offset: number;
}

function useMyMemoryBooks(limit = 20, offset = 0) {
  const [data, setData] = useState<MyMemoryBooksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(
          `http://localhost:3000/api/memory-books/my?limit=${limit}&offset=${offset}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to fetch');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit, offset]);

  return { data, loading, error };
}

// Sử dụng trong component
function MyMemoryBooksPage() {
  const { data, loading, error } = useMyMemoryBooks();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Memory Books của tôi ({data.total.myBooks})</h2>
      <div>
        {data.data.myBooks.map(book => (
          <div key={book.id}>
            <h3>{book.name}</h3>
            <p>Type: {book.type}</p>
            <p>Created: {new Date(book.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <h2>Memory Books đã đóng góp ({data.total.contributedBooks})</h2>
      <div>
        {data.data.contributedBooks.map(book => (
          <div key={book.id}>
            <h3>{book.name}</h3>
            <p>Type: {book.type}</p>
            <p>Created: {new Date(book.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Lưu ý quan trọng

1. **Authentication bắt buộc**: Endpoint này yêu cầu user phải đăng nhập
2. **Pagination**: Cả `myBooks` và `contributedBooks` đều dùng chung `limit` và `offset`
3. **Không trùng lặp**: MemoryBooks mà user vừa là leader vừa đã contribute sẽ chỉ xuất hiện trong `myBooks`
4. **Field `isLeader`**: Tất cả endpoints trả về MemoryBook giờ đều có field `isLeader` để frontend có thể phân biệt

---

## Migration Notes

Nếu có data cũ trong database:
- Tất cả MemoryBooks hiện tại sẽ được tự động set `isLeader: true` cho user tạo (dựa trên `userId`)
- Contributions cũ có thể không có `userId`, nhưng contributions mới sẽ luôn có `userId`

---

## Testing

### Test với curl

```bash
# Lấy MemoryBooks của tôi
curl -X GET "http://localhost:3000/api/memory-books/my?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
  "data": {
    "myBooks": [...],
    "contributedBooks": [...]
  },
  "total": {
    "myBooks": 0,
    "contributedBooks": 0
  },
  "limit": 10,
  "offset": 0
}
```

---

## UI/UX Suggestions

1. **Tab/Section riêng**: Có thể tách thành 2 tabs:
   - "Memory Books của tôi" (myBooks)
   - "Đã đóng góp" (contributedBooks)

2. **Badge/Indicator**: Hiển thị badge "Leader" hoặc icon khác nhau cho MemoryBooks mà user là leader

3. **Empty States**: 
   - Nếu `myBooks` rỗng: "Bạn chưa tạo Memory Book nào"
   - Nếu `contributedBooks` rỗng: "Bạn chưa đóng góp cho Memory Book nào"

4. **Pagination**: Có thể implement pagination riêng cho mỗi section hoặc dùng chung
