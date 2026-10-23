<div align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/3514/3514491.png" alt="ShopStop Logo" width="80" />
  <h1>ShopStop — Full-Stack MERN E-Commerce Platform</h1>
  <p>An e-commerce application built with React, Redux Toolkit, Node.js, Express, and MongoDB, with OTP-based registration, seller tools, payments, and inventory automation.</p>
</div>

---

## Features

- **OTP-Based Registration:** Email-based one-time password verification during registration, powered by Nodemailer.
- **Customer Accounts:** JWT-based authentication and account access.
- **Seller Functionality:** Seller-facing product and inventory management in place of a centralized admin workflow.
- **Auto-Restock:** Inventory restocking support to help keep products available.
- **API Polling:** Periodic API requests to refresh product stock status.
- **Product Images:** Cloudinary integration for image storage, with Multer handling uploads.
- **Shopping Cart:** Redux Toolkit for cart state management.
- **Payments:** Razorpay integration for checkout and payment processing.
- **Order History:** Customer order information associated with user accounts.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, React Router, Redux Toolkit |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcryptjs |
| OTP / Email | Nodemailer | AppsScript
| Payments | Razorpay |
| Image Uploads | Multer, Cloudinary |

---

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection string
- Credentials for the external services you use, such as Razorpay, Cloudinary, and SMTP email

### 1. Configure the backend

Open a terminal in `backend/` and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` and configure the values required by your implementation. For example:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shopstop
JWT_SECRET=replace_with_a_secure_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Set the SMTP variables expected by your Nodemailer configuration.
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

Use the exact environment-variable names expected by your code. The SMTP names above are examples; adjust them if the application uses different names. Do not commit secrets to version control.

### 2. Configure the frontend

Open another terminal and install the frontend dependencies:

```bash
cd frontend
npm install
```

The frontend package is configured to proxy API requests to `http://localhost:5000` during development.

### 3. Seed the database (optional)

If you want to populate the database with the project's seed data, run the backend seed script:

```bash
cd backend
npm run seed
```

Use the seller or customer credentials defined by your actual seed script, if any. This README does not assume default login credentials.

### 4. Run the application

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm start
```

By default, the backend uses port `5000` and Create React App serves the frontend on port `3000`, unless your local configuration specifies otherwise.

---

## Seller and Inventory Workflow

ShopStop uses a seller-oriented workflow rather than relying on a single admin dashboard. Sellers can manage their product listings and inventory according to the permissions implemented by the application.

The auto-restock feature supports inventory replenishment, while API polling periodically checks for updated data. The exact restock rules, polling interval, and endpoints depend on the implementation in the repository.

## API and Testing

The backend exposes API routes through Express. You can test available endpoints with Postman or another API client. For protected routes, authenticate first and provide the JWT in the format expected by the backend.

If the repository includes a Postman collection, import that file into Postman and configure its environment variables before sending requests.

## Production Notes

Before deploying:

1. Set production environment variables in your hosting provider.
2. Use a secure, unique `JWT_SECRET`.
3. Configure MongoDB access restrictions and production credentials.
4. Configure SMTP, Razorpay, and Cloudinary credentials as required.
5. Set the frontend API URL and CORS settings for the deployed environment.
6. Verify the production build and start commands against the scripts in the root, `backend/`, and `frontend/` package files.

The supplied backend and frontend package files define their own scripts. If you want a single root-level command or Render-specific deployment workflow, configure those scripts in the root package or hosting settings first.
