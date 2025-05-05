# Thriftify

Thriftify is an online marketplace platform for buying and selling second-hand items, promoting sustainability through reuse and reducing waste.

## Demo

[Live Demo](https://thriftify-demo.herokuapp.com)

## Features

- **User Authentication:** Secure registration and login system
- **Product Listings:** Create, view, update, and delete listings
- **Categories:** Browse items by categories
- **Search & Filters:** Find items by location, category, price, etc.
- **Bookmarks:** Save favorite items for later
- **Messaging:** Real-time chat between buyers and sellers
- **Payment Integration:** Secure checkout with PayPal
- **Order Management:** Track purchases and sales
- **Responsive Design:** Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for authentication
- PayPal API for payment integration

### Frontend
- EJS templates
- JavaScript
- CSS

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Setup Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/thriftify.git
cd thriftify
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/thriftify
ACCESS_TOKEN_SECRETE=your_jwt_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

4. Start the server
```bash
npm start
```

5. Visit `http://localhost:3000` in your browser

## API Documentation

### User Endpoints

- **POST /api/v1/user/register** - Register a new user
- **POST /api/v1/user/login** - Login and receive authentication token
- **GET /api/v1/user/profile** - Get current user profile
- **PUT /api/v1/user/profile** - Update user profile

### Listing Endpoints

- **GET /api/v1/listings** - Get all listings with optional filters
- **POST /api/v1/listings** - Create a new listing
- **GET /api/v1/listings/:id** - Get specific listing details
- **PUT /api/v1/listings/:id** - Update a listing
- **DELETE /api/v1/listings/:id** - Delete a listing

### Bookmark Endpoints

- **GET /api/v1/bookmarks** - Get all bookmarks for current user
- **POST /api/v1/bookmarks/:listingId** - Add a listing to bookmarks
- **DELETE /api/v1/bookmarks/:listingId** - Remove a listing from bookmarks

### Category Endpoints

- **GET /api/v1/category** - Get all categories
- **POST /api/v1/category** - Create a new category (admin only)

### Order Endpoints

- **GET /api/v1/orders** - Get all orders for current user
- **POST /api/v1/orders** - Create a new order
- **GET /api/v1/orders/:id** - Get order details

### Chat Endpoint

- **GET /api/v1/chat** - Access the chat interface

## Database Schema

### User

- `fullname`: String
- `email`: String (unique)
- `password`: String (hashed)
- `createdAt`: Date
- `updatedAt`: Date

### Listing

- `title`: String
- `description`: String
- `price`: Number
- `category`: ObjectId (reference to Category)
- `location`: String
- `images`: [String]
- `postedBy`: ObjectId (reference to User)
- `status`: String (available, sold)
- `createdAt`: Date
- `updatedAt`: Date

### Bookmark

- `user`: ObjectId (reference to User)
- `listing`: ObjectId (reference to Listing)
- `createdAt`: Date

### Order

- `buyer`: ObjectId (reference to User)
- `listing`: ObjectId (reference to Listing)
- `seller`: ObjectId (reference to User)
- `paymentId`: String
- `status`: String (pending, completed, cancelled)
- `createdAt`: Date
- `updatedAt`: Date

### Category

- `name`: String
- `description`: String

## Project Structure

```
thriftify/
├── DataBase/
│   └── connect.js
├── Routes/
│   ├── bookmark.router.js
│   ├── category.router.js
│   ├── listing.router.js
│   ├── orders.router.js
│   └── user.router.js
├── Schemas/
│   ├── bookmark.schemas.js
│   ├── category.schemas.js
│   ├── listings.schemas.js
│   ├── order.schemas.js
│   └── user.schemas.js
├── utils/
│   └── asynchandler.js
├── views/
│   ├── chat.ejs
│   ├── home.ejs
│   ├── index.ejs
│   ├── payment-cancel.ejs
│   └── payment-success.ejs
├── app.js
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
