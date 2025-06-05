# E-Commerce API Documentation

Your Django e-commerce backend is now ready! The server is running on `http://127.0.0.1:8001/`

## Authentication

### Register a new user

**POST** `/api/auth/register/`

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "password_confirm": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "your_auth_token_here"
}
```

### Login

**POST** `/api/auth/login/`

```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "token": "your_auth_token_here",
  "user_id": 1,
  "email": "john@example.com",
  "username": "johndoe"
}
```

### Logout

**POST** `/api/auth/logout/`
Headers: `Authorization: Token your_auth_token_here`

## Categories

### Get all categories

**GET** `/api/categories/`

**Response:**

```json
[
  {
    "id": 1,
    "name": "Snacks",
    "description": "Delicious snacks and treats",
    "image": "https://images.unsplash.com/photo-1575474041544-51f1d6f2ad18?w=400"
  }
]
```

### Get category details

**GET** `/api/categories/{id}/`

## Products

### Get all products

**GET** `/api/products/`

Query parameters:

- `category`: Filter by category ID
- `search`: Search in product name and description

**Response:**

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Classic Potato Chips",
      "description": "Crispy and salty potato chips made from premium potatoes.",
      "price": "2.99",
      "stock": 50,
      "category": {
        "id": 1,
        "name": "Snacks",
        "description": "Delicious snacks and treats",
        "image": "https://images.unsplash.com/photo-1575474041544-51f1d6f2ad18?w=400"
      },
      "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
      "is_active": true,
      "average_rating": 0,
      "is_in_stock": true,
      "created_at": "2025-06-05T05:12:45.123456Z",
      "updated_at": "2025-06-05T05:12:45.123456Z"
    }
  ]
}
```

### Get product details

**GET** `/api/products/{id}/`

## Cart Management

### Get cart items

**GET** `/api/cart/`
Headers: `Authorization: Token your_auth_token_here`

### Add item to cart

**POST** `/api/cart/add/`
Headers: `Authorization: Token your_auth_token_here`

```json
{
  "product_id": 1,
  "quantity": 2
}
```

### Update cart item

**PUT** `/api/cart/{id}/update/`
Headers: `Authorization: Token your_auth_token_here`

```json
{
  "quantity": 3
}
```

### Remove item from cart

**DELETE** `/api/cart/{id}/delete/`
Headers: `Authorization: Token your_auth_token_here`

### Clear entire cart

**DELETE** `/api/cart/clear/`
Headers: `Authorization: Token your_auth_token_here`

## Orders

### Get user orders

**GET** `/api/orders/`
Headers: `Authorization: Token your_auth_token_here`

### Get order details

**GET** `/api/orders/{id}/`
Headers: `Authorization: Token your_auth_token_here`

### Create order from cart

**POST** `/api/orders/create/`
Headers: `Authorization: Token your_auth_token_here`

```json
{
  "shipping_address": "123 Main St, City, Country"
}
```

**Response:**

```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "status": "pending",
  "total_amount": "15.96",
  "shipping_address": "123 Main St, City, Country",
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Classic Potato Chips",
        "price": "2.99"
      },
      "quantity": 2,
      "price": "2.99",
      "total_price": "5.98"
    }
  ],
  "created_at": "2025-06-05T05:12:45.123456Z",
  "updated_at": "2025-06-05T05:12:45.123456Z"
}
```

## Reviews

### Get product reviews

**GET** `/api/products/{product_id}/reviews/`

### Create review

**POST** `/api/reviews/create/`
Headers: `Authorization: Token your_auth_token_here`

```json
{
  "product_id": 1,
  "rating": 5,
  "comment": "Great product!"
}
```

## Wishlist

### Get wishlist items

**GET** `/api/wishlist/`
Headers: `Authorization: Token your_auth_token_here`

### Add item to wishlist

**POST** `/api/wishlist/add/`
Headers: `Authorization: Token your_auth_token_here`

```json
{
  "product_id": 1
}
```

### Remove item from wishlist

**DELETE** `/api/wishlist/{id}/delete/`
Headers: `Authorization: Token your_auth_token_here`

## User Profile

### Get/Update profile

**GET/PUT** `/api/profile/`
Headers: `Authorization: Token your_auth_token_here`

**PUT Request Body:**

```json
{
  "address": "123 New Address",
  "phone_number": "+1234567890",
  "city": "New City",
  "country": "New Country",
  "postal_code": "12345"
}
```

## Dashboard Stats

### Get dashboard statistics

**GET** `/api/dashboard/stats/`

**Response (authenticated user):**

```json
{
  "total_products": 10,
  "total_categories": 4,
  "cart_items": 3,
  "wishlist_items": 2,
  "total_orders": 5
}
```

## Testing the API

You can test the API using tools like:

- **Postman** or **Insomnia** for GUI-based testing
- **curl** for command-line testing
- **Your frontend application**

### Example curl commands:

1. **Register a user:**

```bash
curl -X POST http://127.0.0.1:8001/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

2. **Login:**

```bash
curl -X POST http://127.0.0.1:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

3. **Get products:**

```bash
curl http://127.0.0.1:8001/api/products/
```

4. **Add to cart (replace TOKEN with actual token):**

```bash
curl -X POST http://127.0.0.1:8001/api/cart/add/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

## Admin Interface

Access the Django admin at: `http://127.0.0.1:8001/admin/`

- Username: `e opencode`
- Password: (the password you set during superuser creation)

## Next Steps for Frontend Integration

1. **Set up CORS**: Already configured to allow all origins for development
2. **Authentication**: Use token-based authentication - store the token in localStorage/sessionStorage
3. **API Base URL**: Use `http://127.0.0.1:8001/api/` as your base URL
4. **Error Handling**: Handle HTTP status codes (400, 401, 404, 500)
5. **Pagination**: Most list endpoints return paginated results

## Sample Test User

- Username: `testuser`
- Password: `testpass123`
- Email: `test@example.com`

Your e-commerce backend is now fully functional with all the essential features for an online store!
