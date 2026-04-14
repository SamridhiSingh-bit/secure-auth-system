# 📚 Code Walkthrough - Implementation Details

## 3.1.1: Secure Login Form Implementation

### Client-Side Validation

**File: `client/src/components/LoginForm.js`**

The login form implements three key validation features:

1. **Email Validation**
   ```javascript
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!email) {
     newErrors.email = 'Email is required';
   } else if (!emailRegex.test(email)) {
     newErrors.email = 'Invalid email format';
   }
   ```
   - Validates email format with regex pattern
   - Ensures email contains @ and domain

2. **Password Validation**
   ```javascript
   if (!password) {
     newErrors.password = 'Password is required';
   } else if (password.length < 6) {
     newErrors.password = 'Password must be at least 6 characters';
   }
   ```
   - Checks password exists
   - Enforces minimum 6 character requirement

3. **Real-time Error Display**
   ```javascript
   <input
     value={email}
     onChange={(e) => {
       setEmail(e.target.value);
       if (errors.email) setErrors({ ...errors, email: '' });
     }}
     className={errors.email ? 'input-error' : ''}
   />
   {errors.email && <span className="error-message">{errors.email}</span>}
   ```
   - Shows red border on error
   - Displays error message below input
   - Clears error on user input

4. **Form Submission**
   ```javascript
   const handleSubmit = async (e) => {
     e.preventDefault();
     if (!validateForm()) return;
     
     const result = await login(email, password);
     if (result.success) {
       navigate('/dashboard');
     }
   };
   ```

### State Management

Uses React hooks for form state:
- `useState` for form inputs
- Error handling with error object
- Loading state during submission
- Integration with AuthContext

---

## 3.1.2: Protected Routes & JWT Authentication

### Backend JWT Implementation

**File: `server/middleware/auth.js`**

```javascript
const verifyToken = (req, res, next) => {
  // 1. Extract token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // 2. Verify JWT signature using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach decoded user data to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      error: error.message 
    });
  }
};
```

**Token Generation:**

File: `server/routes/auth.js`

```javascript
const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### Frontend Authentication Flow

**File: `client/src/context/AuthContext.js`**

Global state management:
```javascript
const login = useCallback(async (email, password) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });
    
    const { token: newToken, user: userData } = response.data;
    
    // 1. Store token in localStorage
    localStorage.setItem('token', newToken);
    
    // 2. Update state
    setToken(newToken);
    setUser(userData);
    
    return { success: true, user: userData };
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Login failed';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
}, []);
```

### Protected Route Component

**File: `client/src/components/ProtectedRoute.js`**

```javascript
export const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, user } = useAuth();

  // 1. Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if roles are required and user has them
  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

### API Client with Interceptors

**File: `client/src/utils/apiClient.js`**

```javascript
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// 1. Request interceptor - adds token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response interceptor - handles 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 3.1.3: Role-Based Access Control (RBAC)

### Backend RBAC Middleware

**File: `server/middleware/auth.js`**

```javascript
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    // 1. Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // 2. Check if user's role is in required roles array
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};
```

### Protected Routes with RBAC

**File: `server/routes/protected.js`**

1. **All Users** (any authenticated user)
   ```javascript
   router.get('/user-data', verifyToken, (req, res) => {
     res.json({
       message: 'User data retrieved',
       data: {
         userId: req.user.id,
         userEmail: req.user.email,
         // ... user data
       }
     });
   });
   ```

2. **Manager & Admin Only**
   ```javascript
   router.get('/manager-data', 
     verifyToken, 
     checkRole(['manager', 'admin']), 
     (req, res) => {
       res.json({
         message: 'Manager data retrieved',
         data: {
           // ... manager reports
           reportData: {
             totalUsers: 150,
             activeUsers: 120,
             inactiveUsers: 30
           }
         }
       });
     }
   );
   ```

3. **Admin Only**
   ```javascript
   router.get('/admin-data', 
     verifyToken, 
     checkRole(['admin']), 
     (req, res) => {
       res.json({
         message: 'Admin data retrieved',
         data: {
           // ... admin system data
           systemData: {
             totalSessions: 500,
             systemHealth: '99.9%',
             lastBackup: new Date().toISOString()
           }
         }
       });
     }
   );
   ```

### Frontend RBAC Implementation

**File: `client/src/pages/Dashboard.js`**

1. **Role-Based Section Display**
   ```javascript
   {(user?.role === 'manager' || user?.role === 'admin') && (
     <div className="card manager-data-card">
       <h2>📋 Manager Dashboard</h2>
       {/* Manager & admin see this section */}
     </div>
   )}

   {user?.role === 'admin' && (
     <div className="card admin-data-card">
       <h2>⚙️ Admin Console</h2>
       {/* Only admin sees this section */}
     </div>
   )}
   ```

2. **Fetching Role-Specific Data**
   ```javascript
   const fetchManagerData = async () => {
     try {
       const response = await apiClient.get('/protected/manager-data');
       setManagerData(response.data.data);
     } catch (err) {
       // 403 error handled - user doesn't have permission
       setError(err.response?.data?.message || 'Access denied');
     }
   };
   ```

### Protected Route with Role Check

**File: `client/src/App.js`**

```javascript
<Routes>
  {/* ... other routes */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
```

---

## Complete User Journey

### Journey 1: New User Registration

```
1. User clicks "Register here" link
   └─> Navigate to /register page

2. RegisterForm component renders
   ├─ Name input
   ├─ Email input (with regex validation)
   ├─ Password input (6+ chars)
   └─ Confirm password input

3. User fills form and clicks Register
   ├─ Client-side validation checks
   │  ├─ Name not empty & at least 2 chars
   │  ├─ Email format valid
   │  ├─ Password >= 6 characters
   │  └─ Passwords match
   │
   └─ If valid:
      ├─ POST /api/auth/register
      ├─ Server hashes password with bcryptjs
      ├─ Create user with role='user'
      └─ Return success message

4. Redirect to /login
   └─> User can now login

5. User logs in
   └─> Redirects to dashboard
   └─> See only "User Information" section
```

### Journey 2: Admin User Login & Dashboard

```
1. User enters admin@example.com / password
   ├─ LoginForm validates input
   └─ POST /api/auth/login

2. Backend processes
   ├─ Find user by email
   ├─ Compare password with bcrypt
   ├─ Generate JWT with role='admin'
   └─ Return token

3. Frontend
   ├─ Store token in localStorage
   ├─ Update AuthContext
   └─ Navigate to /dashboard

4. Dashboard Loads
   ├─ ProtectedRoute checks:
   │  ├─ isAuthenticated? ✅
   │  └─ Token valid? ✅
   │
   └─ Render Dashboard
      ├─ Show user info
      ├─ Show manager dashboard (role='admin' ✓)
      └─ Show admin console (role='admin' ✓)

5. Admin clicks "Fetch Manager Data"
   ├─ GET /api/protected/manager-data
   ├─ apiClient adds: Authorization: Bearer <token>
   │
   ├─ Backend:
   │  ├─ verifyToken middleware checks token
   │  ├─ checkRole(['manager', 'admin']) checks role
   │  └─ Admin role ✓ → Proceed
   │
   └─ Return manager data

6. Admin clicks "Fetch Admin Data"
   ├─ GET /api/protected/admin-data
   ├─ Same flow...
   └─ checkRole(['admin']) → Admin role ✓
   └─ Return admin data
```

### Journey 3: Regular User Attempts Admin Access

```
1. User logs in with user@example.com / password
   ├─ Token generated with role='user'
   └─ Redirected to dashboard

2. Dashboard renders
   ├─ ProtectedRoute checks auth ✓
   ├─ Render Dashboard
   │  ├─ Show user info section ✓
   │  ├─ Manager section? role='user', needs ['manager','admin']
   │  └─ NOT RENDERED (hidden by {(user?.role === 'manager' || user?.role === 'admin') && ...})
   │
   └─ Admin section? role='user', needs ['admin']
      └─ NOT RENDERED (hidden by {user?.role === 'admin' && ...})

3. If user tries API call directly via fetch
   ├─ GET /api/protected/manager-data
   ├─ Authorization: Bearer <token with role='user'>
   │
   ├─ Backend:
   │  ├─ verifyToken ✓ (token valid)
   │  ├─ checkRole(['manager', 'admin']) → role='user'
   │  └─ User NOT in required roles ✗
   │
   └─ Return 403: { message: 'Access denied' }

4. Frontend error handling
   ├─ catch error with 403
   └─ Display: "Access denied"
```

---

## Key Code Patterns

### Pattern 1: Middleware Chain
```javascript
router.get('/route', 
  verifyToken,        // Check JWT is valid
  checkRole(['admin']), // Check user role
  controller          // Process request
);
```

### Pattern 2: React Context Hook
```javascript
// Using auth context
const { user, token, login, logout } = useAuth();

// useAuth hook definition
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Pattern 3: Protected Route
```javascript
<ProtectedRoute requiredRoles={['admin']}>
  <AdminPanel />
</ProtectedRoute>
```

### Pattern 4: Conditional Rendering
```javascript
{user?.role === 'admin' && <AdminSection />}
{['manager', 'admin'].includes(user?.role) && <ManagerSection />}
```

---

**Code is well-documented and follows React/Express best practices** 🎯
