# LMS eLearning Marketplace - Handover Documentation

## 1. Project Overview

This project is a full-stack Learning Management System (LMS) designed to facilitate a two-sided marketplace for online education. It solves the problem of connecting knowledge providers (Instructors) with knowledge seekers (Students).

The system focuses on the core user journeys of:
- **Content Creation:** Enabling instructors to draft, manage, and publish structured courses.
- **Consumption:** Allowing students to browse, enroll, and consume video-based content securely.
- **Access Control:** Enforcing strict ownership and enrollment rules to protect intellectual property.

The scope is intentionally limited to a "Free Enrollment" model for this version, removing the complexity of payment gateways to focus heavily on system architecture, data integrity, and role-based security.

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide React (Icons)
- **Animation:** Framer Motion
- **State Management:** React Context API (Auth)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Multer (Local/Cloudinary integration ready)

### Database
- **Primary DB:** MongoDB (Mongoose ODM)

## 3. System Roles

The system enforces strict role separation:

1.  **Student:** Can browse the marketplace, search for courses, enroll in published courses, and view content they own.
2.  **Instructor:** Can create courses, manage course content (lessons), set visibility (Draft/Published), and view enrollment statistics for their own courses.

## 4. Core Features (Implemented)

### Authentication & Authorization
- Secure Registration and Login flows using JWT.
- Persistent session management via local storage token handling.
- Role-based route protection middleware.

### Course Management
- **Creation:** Multi-step form for creating courses with titles, descriptions, categories, and pricing.
- **Publishing Workflow:** Courses have `draft` and `published` states. Only published courses appear in the public marketplace.
- **Draft Security:** Draft courses are invisible to public API endpoints and cannot be enrolled in.

### Marketplace & Enrollment
- **Browsing:** Publicly accessible course listing with search and filtering.
- **Enrollment:** One-click enrollment mechanism (Free tier logic).
- **Duplicate Prevention:** Backend logic prevents students from enrolling in the same course twice.

### Dashboard & Analytics
- **Student Dashboard:** Displays only enrolled courses. Empty states guide users to the marketplace.
- **Instructor Dashboard:** Displays owned courses with calculated statistics (Total Students, Estimated Earnings) derived from real backend data.

### Content Security
- **Lesson Gating:** Un-enrolled users can view course metadata but cannot access video URLs or lesson content.
- **Structure Locking:** Instructors cannot delete courses or remove lessons if students are actively enrolled, preventing data loss for users.

## 5. Architecture Overview

The application follows a classic Client-Server architecture:

1.  **Client (Next.js):** Handles UI rendering and state. It treats the backend as a headless API, sending tokens in the `Authorization` header for protected actions.
2.  **Server (Express/Node):** Handles business logic. It validates all inputs, enforces role permissions, and interacts with the database.
3.  **Database (MongoDB):** Stores relational references (e.g., `Course` has an `instructor` ID; `User` has an array of `purchasedCourses`).

### Key Design Constraint
**Enrollment as Truth:** Access to content is not determined by the frontend. The backend `getCourseById` endpoint checks the user's token against the database enrollment records. If the user is not enrolled, the backend literally strips the video URLs from the response before sending it to the client.

## 6. Data Models

### User Schema
- `name`, `email`, `password` (hashed)
- `role`: Enum ['student', 'instructor']
- `purchasedCourses`: Array of Course ObjectIDs

### Course Schema
- `title`, `description`, `price`, `category`
- `instructor`: User ObjectID reference
- `status`: Enum ['draft', 'published']
- `lessons`: Array of objects `{ title, content, videoUrl }`

## 7. Security & Integrity

### Authentication Strategy
- Stateless JWT authentication.
- Passwords hashed via Bcrypt (implied standard).
- `optionalAuth` middleware allows public browsing while enabling personalized responses if a token is present.

### Access Control
- **Vertical Privilege Escalation Prevention:** Students cannot access Instructor endpoints (e.g., `/create`).
- **Horizontal Privilege Escalation Prevention:** Instructors cannot edit or delete courses they do not own.

### Marketplace Integrity
- **Draft Protection:** API automatically filters out `draft` courses from public listings.
- **Self-Enrollment:** Instructors are blocked from enrolling in their own courses to prevent metric manipulation.
- **Content Locking:** Enrollment verification happens server-side.

## 8. UX Design Principles

- **Feedback Loops:** All async actions (Login, Enroll, Create) show loading spinners and explicit success/error messages.
- **Empty States:** "No courses found" or "No enrollments yet" screens guide users to the correct action rather than showing blank pages.
- **Defensive UI:** Buttons are disabled when actions are processing. Form validation prevents submission of incomplete data.

## 9. How to Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas URI)

### Backend Setup
1.  Navigate to `/backend`
2.  Create `.env` file:
    ```
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    CLOUDINARY_CLOUD_NAME=...
    CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...
    ```
3.  Run `npm install`
4.  Run `npm start`

### Frontend Setup
1.  Navigate to `/frontend`
2.  Create `.env.local`:
    ```
    NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
    ```
3.  Run `npm install`
4.  Run `npm run dev`

## 10. Future Enhancements

The following features were out of scope for this release but fit the architecture:
- **Payments:** Integration with Stripe to govern the enrollment endpoint.
- **Progress Tracking:** Storing `completedLessons` in a new Enrollment model.
- **Reviews:** Enabling students to rate courses they have finished.
- **Certificates:** PDF generation upon 100% completion.
