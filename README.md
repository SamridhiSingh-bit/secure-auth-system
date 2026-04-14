# 🔐 Secure Authentication System with JWT & RBAC

A complete full-stack authentication system built with **React**, **Express.js**, **JWT**, and **Role-Based Access Control (RBAC)**. This project implements secure login, protected routes, and role-specific access to resources.

## ✨ Features

### 3.1.1 - Secure Login Form with Client-Side Validation
- ✅ Email format validation
- ✅ Password strength requirements (minimum 6 characters)
- ✅ Real-time error feedback
- ✅ React state management for form handling
- ✅ Secure password hashing with bcryptjs
- ✅ Beautiful, responsive UI

### 3.1.2 - Protected Routes & JWT Authentication
- ✅ JWT token generation and validation
- ✅ Protected API endpoints with middleware
- ✅ React Router integration for client-side route protection
- ✅ Token refresh on page reload
- ✅ Automatic logout on token expiration
- ✅ Bearer token authentication

### 3.1.3 - Role-Based Access Control (RBAC)
- ✅ Three user roles: **Admin**, **Manager**, **User**
- ✅ Role-specific API endpoints
- ✅ Role-based route protection in UI
- ✅ Server-side permission enforcement
- ✅ Access denied handling with 403 responses

## 📁 Project Structure

```
89fsd/
├── server/                 # Express.js backend
│   ├── middleware/
│   │   └── auth.js        # JWT verification & RBAC middleware
│   ├── routes/
│   │   ├── auth.js        # Authentication endpoints
│   │   └── protected.js   # Protected resources with RBAC
│   ├── index.js           # Express server setup
│   ├── package.json
│   └── .env.example
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.js       # Secure login with validation
│   │   │   ├── LoginForm.css
│   │   │   ├── RegisterForm.js    # User registration
│   │   │   ├── RegisterForm.css
│   │   │   └── ProtectedRoute.js  # Route protection component
│   │   ├── pages/
│   │   │   ├── Dashboard.js       # Main dashboard with role-based content
│   │   │   ├── Dashboard.css
│   │   │   ├── Unauthorized.js    # 403 error page
│   │   │   └── Unauthorized.css
│   │   ├── context/
│   │   │   └── AuthContext.js     # Global auth state management
│   │   ├── utils/
│   │   │   ├── useAuth.js         # Auth hook
│   │   │   └── apiClient.js       # Axios client with interceptors
│   │   ├── App.js                 # Main app routing
│   │   ├── index.js               # React entry point
│   │   └── public/
│   │       └── index.html
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Installation

#### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env and set JWT_SECRET if needed
```

#### 2. Frontend Setup
```bash
cd client
npm install
```

### Running the Application

#### Start the Backend (Terminal 1)
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
# Server runs on http://localhost:5000
```

#### Start the Frontend (Terminal 2)
```bash
cd client
npm start
# React app opens on http://localhost:3000
```

## 🔑 Demo Credentials

Use these credentials to test the application:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password` |
| Manager | `manager@example.com` | `password` |
| User | `user@example.com` | `password` |

## 🎯 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login and receive JWT token
- `GET /profile` - Get current user profile (requires token)
- `POST /logout` - Logout (client-side token removal)

### Protected Routes (`/api/protected`)
- `GET /user-data` - Accessible to all authenticated users
- `GET /manager-data` - Accessible to managers and admins only
- `GET /admin-data` - Accessible to admins only
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

## 🔐 Security Features

### Client-Side Validation
- Email format validation using regex
- Password minimum length requirement
- Confirming password matches
- Real-time error messages

### Server-Side Authentication
- JWT tokens with 24-hour expiration
- Bcryptjs password hashing
- Secure token verification middleware
- CORS protection

### Authorization (RBAC)
- Role-based endpoint access
- Middleware-enforced permission checks
- Route protection with role validation
- Access denied responses (403)

## 📊 Component Overview

### AuthContext
Manages global authentication state:
- `user` - Logged-in user data
- `token` - JWT token
- `isAuthenticated` - Authentication status
- Methods: `login()`, `logout()`, `register()`

### ProtectedRoute
React Router component for route protection:
```jsx
<ProtectedRoute requiredRoles={['admin', 'manager']}>
  <AdminPanel />
</ProtectedRoute>
```

### Dashboard
Main application interface showing:
- User profile information
- Role-specific data displays
- Manager reports (for managers/admins)
- Admin console (for admins only)

## 🛠 Development

### Environment Variables

**Backend (.env)**
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Making API Calls

Use the provided `apiClient`:
```javascript
import { apiClient } from '../utils/apiClient';

// Automatically includes JWT token in headers
const response = await apiClient.get('/protected/user-data');
```

## 🧪 Testing

### Test User Registration
1. Navigate to `/register`
2. Fill in the form with unique email
3. Submit and redirect to login

### Test Login
1. Navigate to `/login`
2. Enter credentials from "Demo Credentials" section
3. View role-specific dashboard content

### Test RBAC
1. Login as different roles
2. Admin sees all sections
3. Manager sees manager + user sections
4. User sees only user section

## 📦 Dependencies

### Backend
- `express` - Web framework
- `jsonwebtoken` - JWT token generation
- `bcryptjs` - Password hashing
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client

## 🚢 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables on hosting platform
2. Update `REACT_APP_API_URL` to production API
3. Deploy with `npm start`

### Frontend Deployment (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy the `build/` folder
3. Update API proxy in production

## 📝 Notes

- Passwords in demo are intentionally simple for testing
- In production, use strong JWT_SECRET
- Implement actual database (MongoDB/PostgreSQL)
- Add rate limiting for login attempts
- Use HTTPS in production
- Implement token refresh mechanism

## 🤝 Contributing

Feel free to extend this project with:
- Actual database integration
- Email verification
- Password reset functionality
- Two-factor authentication
- OAuth integration
- Session management

## 📄 License

MIT License - Feel free to use for personal and commercial projects

---

**Made with ❤️ for secure authentication**
