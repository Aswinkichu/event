# API Documentation

The Event Management Backend is accessible at `http://localhost:5000/api/v1`.
All protected routes require an `Authorization` header containing a valid JWT:
> `Authorization: Bearer <your_access_token>`

---

## 🏎️ Auth API (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Register a new customer | No |
| **POST** | `/login` | Authenticate user | No |
| **POST** | `/refresh` | Rotate access token | No (Uses Refresh Token) |
| **POST** | `/logout` | Invalidate refresh token | No (Uses Refresh Token) |

### Register Payload Example
```json
{
  "name": "John Doe",
  "email": "customer@example.com",
  "password": "password123",
  "phone": "9876543210",
  "countryCode": "+1",
  "secondaryPhone": "1234567890",
  "photo": "https://example.com/photo.jpg"
}
```

### Login Payload Example
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```
*Response includes `accessToken` and `refreshToken`.*

---

## 👤 Customer API (`/api/v1/customer`)

Allows customers to browse event configurations, calculate pricing dynamically, and place bookings.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/categories` | List all available event categories | No |
| **GET** | `/categories/:id/options` | List components (Food, Decor, etc.) for a category | No |
| **POST** | `/bookings` | Place a custom booking | **Yes (Customer)** |
| **GET** | `/bookings` | View my personal booking history | **Yes (Customer)** |

### 🔍 Advanced Listing Queries (For GET endpoints)
You can append the following query parameters to `GET /categories`, `GET /categories/:id/options`, and `GET /bookings`:
- `?search=<term>`: Search by name or description (Case-insensitive)
- `?sortBy=<field>`: Sort by any field (e.g., `price`, `createdAt`). Default: `createdAt`
- `?order=<asc|desc>`: Sort ordering. Default: `desc`
- `?page=<number>`: Pagination page number. Default: `1`
- `?limit=<number>`: Items per page. Default: `10`

*Note: The `/options` endpoint also accepts a `?type=FOOD|DECOR|VENUE|ADD_ON` filter.*

### Create Booking (`POST /bookings`)
Creates an event booking by aggregating the prices of selected options.

**Request Body:**
```json
{
  "categoryId": "123e4567-e89b-12d3...",
  "selectedOptions": [
    "option_id_1",
    "option_id_2"
  ],
  "eventDate": "2024-12-25T10:00:00Z"
}
```

---

## 🛠️ Admin API (`/api/v1/admin`)

Full CRUD management over the system components.
> **Note:** ALL endpoints here require a valid token where the user role is `ADMIN`.

### Category Management
| Method | Endpoint | Description | 
| :--- | :--- | :--- | 
| **POST** | `/categories` | Create new main category | 
| **PUT** | `/categories/:id` | Update category details | 
| **DELETE** | `/categories/:id` | Drop a category | 

**Create Category Body:**
```json
{
  "name": "House Warming",
  "description": "Celebrate your new home."
}
```

### Options & Pricing Management
| Method | Endpoint | Description | 
| :--- | :--- | :--- | 
| **POST** | `/options` | Create dynamic event component | 
| **PUT** | `/options/:id` | Update price or metadata | 
| **DELETE** | `/options/:id` | Drop an option | 

**Create Option Body:**
```json
{
  "categoryId": "category_uuid_here",
  "type": "FOOD",  // Valid Enums: FOOD, DECOR, VENUE, ADD_ON
  "name": "Continental Platter",
  "price": 1500,
  "isDefault": false
}
```

### Booking Management
| Method | Endpoint | Description | 
| :--- | :--- | :--- | 
| **GET** | `/bookings` | View all system bookings |
| **PATCH** | `/bookings/:id/status`| Update status (PENDING, CONFIRMED, etc.) |

### 🔍 Advanced Booking Queries
You can append the following query parameters to **GET `/bookings`**:
- `?search=<email or name>`: Search bookings by User Email, User Name, or Category Name.
- `?status=<PENDING|CONFIRMED|COMPLETED|CANCELLED>`: Filter by booking status.
- `?sortBy=<field>`: e.g., `totalPrice`, `createdAt`. Default: `createdAt`
- `?order=<asc|desc>`: Default: `desc`
- `?page=<number>` & `?limit=<number>`: Pagination controls.

**Update Status Body:**
```json
{
  "status": "CONFIRMED"
}
```
