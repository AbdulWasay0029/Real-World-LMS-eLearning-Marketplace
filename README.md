# LMS eLearning Marketplace

A full-stack LMS and marketplace built with Next.js, Node.js, Express, MongoDB, and Stripe.

## Setup Instructions

### 1. Backend Setup
1.  Navigate to the `backend` folder: `cd backend`
2.  Install dependencies (if not already done): `npm install`
3.  Configure `.env` file with your credentials (MongoDB URI, Cloudinary, Stripe).
4.  Start the server: `npm start` (Runs on port 5000)

### 2. Frontend Setup
1.  Navigate to the `frontend` folder: `cd frontend`
2.  **IMPORTANT:** Ensure dependencies are installed. If the initial setup hung, run: `npm install`
3.  Install additional required packages: `npm install next-auth axios stripe-js @stripe/react-stripe-js`
4.  Start the development server: `npm run dev` (Runs on port 3000)

## Features
- **User Authentication**: Student, Instructor, and Admin roles.
- **Course Management**: Create, update, delete courses (Instructors).
- **Marketplace**: Browse and purchase courses using Stripe.
- **Dashboards**: Role-specific dashboards.
