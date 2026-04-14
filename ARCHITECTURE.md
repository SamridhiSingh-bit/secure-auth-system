# 🏗 System Architecture & Implementation Details

## Complete System Overview

### 3.1.1 - Secure Login Form Implementation ✅

**Client-Side Validation (LoginForm.js)**
```
User Input
    ↓
├─ Email Validation
│  └─ Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
│
├─ Password Validation
│  └─ Minimum 6 characters
│
└─ Real-time Error Display
   └─ Error messages shown immediately
```

**Features:**
- Regex-based email format validation
- Password length requirements
- Inline error messages
- React state management
- Beautiful gradient UI design

**File: `client/src/components/LoginForm.js`**

---

### 3.1.2 - Protected Routes & JWT Authentication ✅

**Auth Flow:**
```
┌─────────────────────────────────────────────────────┐
│ 1. User enters credentials → LoginForm component   │
│                                                     │
│ 2. Form validates inputs → Client-side validation  │
│                                                     │
│ 3. POST /api/auth/login → Express backend          │
│                                                     │
│ 4. Backend validates → Check email/password        │
│                                                     │
│ 5. Generate JWT token → Valid for 24 hours        │
│    { id, email, role, name, exp }                  │
│                                                     │
│ 6. Return token → Store in localStorage            │
│                                                     │
│ 7. Update AuthContext → Set user & isAuthenticated │
│                                                     │
│ 8. Redirect → Dashboard via React Router          │
└─────────────────────────────────────────────────────┘
```

**JWT Token Structure:**
```javascript
{
  "id": 1,
  "email": "admin@example.com",
  "role": "admin",
  "name": "Admin User",
  "iat": 1234567890,
  "exp": 1234654290  // Expires in 24 hours
}
```

**Protected Route Component:**
```javascript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```
- Checks if token exists
- Verifies user is authenticated
- Redirects to login if not
- Checks role if required

**Key Files:**
- `client/src/context/AuthContext.js` - Global auth state
- `client/src/components/ProtectedRoute.js` - Route protection
- `server/middleware/auth.js` - JWT verification
- `server/routes/auth.js` - Login endpoint

---

### 3.1.3 - Role-Based Access Control (RBAC) ✅

**Roles & Permissions:**

```
┌─────────────────────────────────────────────────────┐
│                    ADMIN                            │
│  ✅ /user-data              (User info)             │
│  ✅ /manager-data           (Reports)               │
│  ✅ /admin-data             (System info)           │
│  ✅ PUT /users/:id          (Update user)           │
│  ✅ DELETE /users/:id       (Delete user)           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   MANAGER                           │
│  ✅ /user-data              (User info)             │
│  ✅ /manager-data           (Reports)               │
│  ❌ /admin-data             (Access Denied 403)     │
│  ❌ PUT /users/:id          (Access Denied 403)     │
│  ❌ DELETE /users/:id       (Access Denied 403)     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    USER                             │
│  ✅ /user-data              (User info)             │
│  ❌ /manager-data           (Access Denied 403)     │
│  ❌ /admin-data             (Access Denied 403)     │
│  ❌ PUT /users/:id          (Access Denied 403)     │
│  ❌ DELETE /users/:id       (Access Denied 403)     │
└─────────────────────────────────────────────────────┘
```

**Backend RBAC Middleware:**
```javascript
// server/middleware/auth.js
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};
```

**Usage in Routes:**
```javascript
// Only admins can access
router.get('/admin-data', 
  verifyToken, 
  checkRole(['admin']), 
  controller
);

// Managers and admins can access
router.get('/manager-data', 
  verifyToken, 
  checkRole(['manager', 'admin']), 
  controller
);

// All authenticated users
router.get('/user-data', 
  verifyToken, 
  controller
);
```

**Frontend Role-Based Rendering:**
```javascript
// Dashboard shows sections based on user role
{user?.role === 'admin' && (
  <div>
    <h2>Admin Console</h2>
    {/* Admin-only content */}
  </div>
)}

{(user?.role === 'manager' || user?.role === 'admin') && (
  <div>
    <h2>Manager Dashboard</h2>
    {/* Manager & admin content */}
  </div>
)}
```

**Key Files:**
- `server/middleware/auth.js` - RBAC middleware
- `server/routes/protected.js` - Protected endpoints
- `client/src/pages/Dashboard.js` - Role-based UI
- `client/src/components/ProtectedRoute.js` - Route protection

---

## Request/Response Flow

### Login Request
```
CLIENT: POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
    ↓
SERVER: (1) Find user by email
        (2) Hash & compare password with bcrypt
        (3) Generate JWT token with role
        (4) Return token + user data
    ↓
CLIENT: {
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "name": "User Name"
  }
}
    ↓
LOCAL STORAGE: { token: "eyJhbGc..." }
CONTEXT: { user: {...}, isAuthenticated: true }
REDIRECT: /dashboard
```

### Protected Route Request
```
CLIENT: GET /api/protected/manager-data
Header: Authorization: Bearer eyJhbGc...
    ↓
SERVER: (1) Extract token from header
        (2) Verify JWT signature
        (3) Decode token → Extract user data
        (4) Check if expired
        (5) Check user.role in requiredRoles
        (6) Allow/Deny request
    ↓
SUCCESS (if admin/manager):
{
  "message": "Manager data retrieved",
  "data": {
    "managerId": 1,
    "managerName": "Admin User",
    "reportData": {
      "totalUsers": 150,
      "activeUsers": 120
    }
  }
}

DENIED (if user):
{
  "message": "Access denied. Insufficient permissions.",
  "statusCode": 403
}
```

---

## File Structure with Implementation Details

```
server/
├── index.js                          # Express setup, CORS, routes
├── middleware/
│   └── auth.js                       # JWT verification, RBAC checking
├── routes/
│   ├── auth.js                       # /register, /login, /profile
│   └── protected.js                  # Role-specific endpoints
├── package.json
├── .env                              # JWT_SECRET, PORT
└── .env.example

client/
├── src/
│   ├── App.js                        # Main routing setup
│   ├── index.js                      # React entry point
│   ├── context/
│   │   └── AuthContext.js            # Global auth state with login/logout
│   ├── utils/
│   │   ├── useAuth.js                # Custom hook for auth
│   │   └── apiClient.js              # Axios with JWT interceptors
│   ├── components/
│   │   ├── LoginForm.js              # Secure login with validation
│   │   ├── LoginForm.css
│   │   ├── RegisterForm.js           # Registration form
│   │   ├── RegisterForm.css
│   │   └── ProtectedRoute.js         # Protected route wrapper
│   ├── pages/
│   │   ├── Dashboard.js              # Main dashboard (role-based)
│   │   ├── Dashboard.css
│   │   ├── Unauthorized.js           # 403 error page
│   │   └── Unauthorized.css
│   ├── public/
│   │   └── index.html
│   └── App.css
└── package.json
```

---

## Security Implementation Details

### Password Security
- **Hashing**: bcryptjs with 10 salt rounds
- **Storage**: Hashed passwords only, never plain text
- **Validation**: Minimum 6 characters (client & server)
- **Comparison**: Using bcrypt.compare() for timing-safe comparison

### Token Security
- **Algorithm**: HS256 (HMAC SHA256)
- **Secret**: Strong JWT_SECRET in .env
- **Expiration**: 24 hours (configurable)
- **Storage**: localStorage (XSS protection recommended for production)
- **Transmission**: Authorization header with Bearer scheme

### Input Validation
- **Email**: Regex pattern validation
- **Password**: Minimum length requirements
- **Role**: Whitelist checking (only valid roles)
- **Endpoint protection**: All protected routes require token + role

### CORS Security
- Configured to allow frontend domain
- Credentials mode for cookies/headers
- Specific origin checking in production

---

## Testing Scenarios

### Scenario 1: Normal Admin User Flow
1. Login as admin@example.com / password
2. See all three dashboard sections ✅
3. Can fetch all data endpoints ✅
4. Can manage other users ✅

### Scenario 2: Manager User Flow
1. Login as manager@example.com / password
2. See user + manager sections ✅
3. Admin section blocked (403) ❌
4. Cannot manage users ❌

### Scenario 3: Regular User Flow
1. Login as user@example.com / password
2. See only user section ✅
3. Manager section blocked (403) ❌
4. Admin section blocked (403) ❌

### Scenario 4: Token Expiration
1. Login and receive token
2. Wait 24 hours (or modify exp in token)
3. Make request with expired token
4. Server returns 401 Unauthorized
5. Client redirects to login

### Scenario 5: Invalid Role in RBAC
1. Token valid but role not in requiredRoles
2. Middleware returns 403
3. Frontend redirects to /unauthorized
4. User sees access denied message

---

## Production Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS (not HTTP)
- [ ] Store JWT in HTTPOnly cookie (not localStorage)
- [ ] Implement refresh token mechanism
- [ ] Add rate limiting on auth endpoints
- [ ] Implement CSRF protection
- [ ] Add input sanitization
- [ ] Use environment variables for API URL
- [ ] Implement actual database
- [ ] Add logging and monitoring
- [ ] Setup error handling and recovery

---

**Architecture designed for security, scalability, and best practices** 🔒
