# ShopSmart Project Details

## Project Overview
ShopSmart is a web-based application designed to streamline the shopping experience for users. It provides a platform for users to browse products, manage their carts, and complete purchases. The application also includes an admin dashboard for managing stores, products, orders, and users.

## Project Structure

### Client
The client-side of the application is built using Next.js and is located in the `client/` directory. It includes the following key components:

- **Pages**: Organized under the `app/` directory, including pages for authentication, cart, checkout, dashboard, orders, products, and store management.
- **Components**: Reusable UI components such as `Navbar`, `Footer`, `ProductCard`, and `ProductGrid`.
- **Context**: Context providers for managing authentication, cart, and store data.
- **Lib**: Utility functions for API calls, price formatting, and theme management.

### Server
The server-side of the application is built using Node.js and Express.js, located in the `server/` directory. It includes:

- **Controllers**: Handle business logic for admin, authentication, orders, products, reviews, and stores.
- **Middleware**: Includes authentication and role-based access control.
- **Models**: Mongoose models for `Order`, `Product`, `Review`, `Store`, and `User`.
- **Routes**: Define API endpoints for admin, authentication, orders, products, and stores.
- **Utils**: Utility functions such as email handling.
- **Scripts**: Includes a `seed.js` script for seeding the database.

### Tests
The `tests/` directory contains test files for authentication and product-related functionalities.

## Environment Variables
The application uses the following environment variables, defined in the `.env` file:

- **Database**:
  - `MONGO_URI`: MongoDB connection string.
  - `MONGO_URI2`: Alternative MongoDB connection string.
- **Authentication**:
  - `JWT_SECRET`: Secret key for JSON Web Tokens.
  - `JWT_EXPIRES_IN`: Expiration time for JWTs.
  - `REFRESH_TOKEN_SECRET`: Secret key for refresh tokens.
- **Client**:
  - `CLIENT_URL`: URL of the client application.
- **Email**:
  - `EMAIL_HOST`: SMTP host.
  - `EMAIL_PORT`: SMTP port.
  - `EMAIL_USER`: Email address for sending emails.
  - `EMAIL_PASS`: Password for the email account.
- **Cloudinary**:
  - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
  - `CLOUDINARY_API_KEY`: Cloudinary API key.
  - `CLOUDINARY_API_SECRET`: Cloudinary API secret.
- **Admin**:
  - `ADMIN_EMAIL`: Admin email address.
  - `ADMIN_PASSWORD`: Admin password.
- **Server**:
  - `NODE_ENV`: Node environment (e.g., development, production).
  - `PORT`: Port number for the server.

## Features

### User Features
- Browse products by category.
- View product details.
- Add products to the cart.
- Checkout and place orders.
- Manage user profile.

### Admin Features
- Manage stores, products, and orders.
- View and manage users.
- Configure store settings.

## Technologies Used

### Frontend
- **Framework**: Next.js
- **Styling**: CSS Modules
- **State Management**: React Context API

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Email**: Nodemailer

### Other Tools
- **Cloudinary**: For image storage.
- **Postman**: For API testing.
- **Jest**: For unit testing.

## Installation and Setup

### Prerequisites
- Node.js
- MongoDB

### Steps
1. Clone the repository.
2. Navigate to the `client/` directory and run `npm install` to install frontend dependencies.
3. Navigate to the `server/` directory and run `npm install` to install backend dependencies.
4. Create a `.env` file in the `server/` directory and configure the environment variables.
5. Run the database seed script: `node scripts/seed.js`.
6. Start the server: `npm start`.
7. Start the client: `npm run dev`.

## Execution Plan
Refer to the `ShopSmart_Execution_Plan.md` file for detailed execution steps.

## Personalization Guide
Refer to the `ShopSmart_Personalization_Guide.md` file for instructions on customizing the application.

## Contributors
- Minahil Kashif

## License
This project is licensed under the MIT License.