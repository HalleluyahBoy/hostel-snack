**Task Overview:**

You are tasked with building the frontend for an e-commerce application using React. The backend is a Django API running on `http://127.0.0.1:8001/api/`. The frontend should be responsive, user-friendly, and include the following features:

1. **Authentication:**

   - Registration page: Allow users to sign up with username, email, password, first name, and last name.
   - Login page: Allow users to log in with username and password.
   - Logout functionality: Allow users to log out.

2. **Categories:**

   - Page to list all categories with names and images.
   - Page to view details of a specific category, including its name, description, and image.

3. **Products:**

   - Page to list all products with options to filter by category and search by name or description. Each product should show name, price, image, and stock status.
   - Page to view details of a specific product, including description, price, image, stock status, and reviews.

4. **Cart Management:**

   - Page to view cart items with product names, quantities, prices, and total cost. Allow updating quantities, removing items, and clearing the cart.
   - Functionality to add products to the cart from product listings or details.

5. **Orders:**

   - Page to list past orders with status and total amount.
   - Page to view details of a specific order, including items, shipping address, and total.
   - Functionality to create an order from the cart by entering a shipping address.

6. **Reviews:**

   - Section on the product details page to view existing reviews.
   - Functionality for authenticated users to leave a review with a rating and comment.

7. **Wishlist:**

   - Page to view wishlist items.
   - Functionality to add products to the wishlist and remove them.

8. **User Profile:**

   - Page to view and update user profile information such as address, phone number, city, country, and postal code.

9. **Dashboard Stats:**
   - Page to display statistics for authenticated users, including total products, categories, cart items, wishlist items, and total orders.

**Technical Requirements:**

- Use React for the frontend, with JSX syntax.
- Include React and dependencies via CDN (e.g., `https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js`).
- Set up routing using `react-router-dom`.
- Handle authentication using token-based authentication:
  - Store the token in `localStorage`.
  - Include the token in the `Authorization` header (e.g., `Authorization: Token your_auth_token_here`) for protected routes.
- Use `Axios` for API requests.
- Implement error handling for HTTP status codes (e.g., 400, 401, 404, 500) with user-friendly messages.
- Support pagination for list views like products and orders, using the `next` and `previous` links in API responses.
- Ensure the design is responsive using Tailwind CSS.
- Use Context API for state management to handle global state like user authentication and cart items.
- Create reusable components for headers, footers, product cards, and forms.
- Avoid using `<form>` onSubmit; use button clicks for form submissions due to sandbox restrictions.

**Backend API Documentation:**

# E-Commerce API Documentation

The Django e-commerce backend is running on `http://127.0.0.1:8001/`.

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

**Instructions for Jules-ai:**

- Assume the React project is initialized in a GitHub repository named 'ecommerce-frontend'.
- Implement the frontend features using the provided API endpoints.
- Create components for:
  - Register: Form for user signup.
  - Login: Form for user login.
  - Categories: List of category cards with images.
  - CategoryDetails: Category name, description, and products.
  - Products: Product cards with filters and search.
  - ProductDetails: Product info, reviews, and add-to-cart button.
  - Cart: List of cart items with update/remove options.
  - Orders: List of past orders.
  - OrderDetails: Order items, shipping address, and total.
  - Wishlist: List of wishlist items with remove option.
  - Profile: Form to view/update user info.
  - Dashboard: Display of user statistics.
- Set up routes (e.g., `/register`, `/login`, `/products`, `/cart`) using `react-router-dom`.
- Protect routes like `/cart`, `/orders`, `/profile` with a `PrivateRoute` component.
- Use Axios for API calls, including token in headers for authenticated requests.
- Handle pagination for products and orders using API’s `next`/`previous` links.
- Style with Tailwind CSS for responsiveness.
- Use Context API for state management.
- Ensure error handling and loading states for all API calls.
- Test the application to verify functionality.
