# 🔧 API Testing Guide - Using curl or Postman

## Backend API Base URL
```
http://localhost:5000/api
```

---

## 📋 Authentication Endpoints

### 1. Register New User

**Method**: POST
**URL**: `http://localhost:5000/api/auth/register`
**Content-Type**: application/json

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Curl Example**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"securePassword123",
    "name":"John Doe"
  }'
```

**Expected Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 4,
    "email": "newuser@example.com",
    "role": "user",
    "name": "John Doe"
  }
}
```

---

### 2. Login User

**Method**: POST
**URL**: `http://localhost:5000/api/auth/login`
**Content-Type**: application/json

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Curl Example**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@example.com",
    "password":"password"
  }'
```

**Expected Response** (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "name": "Admin User"
  }
}
```

**Save the token** for use in protected routes:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Get User Profile

**Method**: GET
**URL**: `http://localhost:5000/api/auth/profile`
**Authorization**: Bearer {token}

**Curl Example**:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response** (200 OK):
```json
{
  "message": "Profile retrieved",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "name": "Admin User",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

---

### 4. Logout

**Method**: POST
**URL**: `http://localhost:5000/api/auth/logout`
**Authorization**: Bearer {token}

**Curl Example**:
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response** (200 OK):
```json
{
  "message": "Logout successful"
}
```

---

## 🔒 Protected Endpoints

### 1. Get User Data (All Users)

**Method**: GET
**URL**: `http://localhost:5000/api/protected/user-data`
**Authorization**: Bearer {token}
**Required Role**: None (all authenticated users)

**Curl Example**:
```bash
curl -X GET http://localhost:5000/api/protected/user-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response** (200 OK):
```json
{
  "message": "User data retrieved",
  "data": {
    "userId": 1,
    "userEmail": "admin@example.com",
    "userName": "Admin User",
    "role": "admin",
    "content": "This is accessible to all authenticated users"
  }
}
```

---

### 2. Get Manager Data (Manager & Admin)

**Method**: GET
**URL**: `http://localhost:5000/api/protected/manager-data`
**Authorization**: Bearer {token}
**Required Role**: manager or admin

**Curl Example**:
```bash
curl -X GET http://localhost:5000/api/protected/manager-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response - Admin/Manager** (200 OK):
```json
{
  "message": "Manager data retrieved",
  "data": {
    "managerId": 1,
    "managerName": "Admin User",
    "content": "This is accessible to managers and admins only",
    "reportData": {
      "totalUsers": 150,
      "activeUsers": 120,
      "inactiveUsers": 30
    }
  }
}
```

**Expected Response - Regular User** (403 Forbidden):
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

---

### 3. Get Admin Data (Admin Only)

**Method**: GET
**URL**: `http://localhost:5000/api/protected/admin-data`
**Authorization**: Bearer {token}
**Required Role**: admin

**Curl Example**:
```bash
curl -X GET http://localhost:5000/api/protected/admin-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response - Admin** (200 OK):
```json
{
  "message": "Admin data retrieved",
  "data": {
    "adminId": 1,
    "adminName": "Admin User",
    "content": "This is accessible to admins only",
    "systemData": {
      "totalSessions": 500,
      "systemHealth": "99.9%",
      "lastBackup": "2024-04-14T15:50:37.037Z"
    }
  }
}
```

**Expected Response - Non-Admin** (403 Forbidden):
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

---

### 4. Update User (Admin Only)

**Method**: PUT
**URL**: `http://localhost:5000/api/protected/users/{id}`
**Authorization**: Bearer {token}
**Required Role**: admin

**Request Body**:
```json
{
  "name": "Updated Name",
  "role": "manager"
}
```

**Curl Example**:
```bash
curl -X PUT http://localhost:5000/api/protected/users/2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "role": "manager"
  }'
```

**Expected Response - Admin** (200 OK):
```json
{
  "message": "User updated successfully",
  "userId": "2",
  "updatedBy": "admin@example.com"
}
```

---

### 5. Delete User (Admin Only)

**Method**: DELETE
**URL**: `http://localhost:5000/api/protected/users/{id}`
**Authorization**: Bearer {token}
**Required Role**: admin

**Curl Example**:
```bash
curl -X DELETE http://localhost:5000/api/protected/users/2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response** (200 OK):
```json
{
  "message": "User deleted successfully",
  "userId": "2",
  "deletedBy": "admin@example.com"
}
```

---

## 🧪 Complete Testing Workflow

### Step 1: Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"Test123",
    "name":"Test User"
  }'
```

### Step 2: Login with New User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"Test123"
  }'
```

**Save the token from response**

### Step 3: Access User Data
```bash
curl -X GET http://localhost:5000/api/protected/user-data \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 4: Try to Access Manager Data (Should Fail)
```bash
curl -X GET http://localhost:5000/api/protected/manager-data \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response should be 403 Forbidden

### Step 5: Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@example.com",
    "password":"password"
  }'
```

**Save admin token**

### Step 6: Access All Admin Data
```bash
curl -X GET http://localhost:5000/api/protected/admin-data \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

This should return admin data successfully

---

## ✅ Error Responses

### No Token Provided
**Status**: 401 Unauthorized
```json
{
  "message": "No token provided"
}
```

### Invalid Token
**Status**: 401 Unauthorized
```json
{
  "message": "Invalid or expired token",
  "error": "jwt malformed"
}
```

### Expired Token
**Status**: 401 Unauthorized
```json
{
  "message": "Invalid or expired token",
  "error": "jwt expired"
}
```

### Invalid Credentials
**Status**: 401 Unauthorized
```json
{
  "message": "Invalid email or password"
}
```

### Insufficient Permissions
**Status**: 403 Forbidden
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

### User Already Exists
**Status**: 409 Conflict
```json
{
  "message": "User already exists"
}
```

---

## 🔄 Using Postman

### Setup Authorization in Postman

1. **Create a request**
2. **Go to Authorization tab**
3. **Select "Bearer Token"**
4. **Paste your token in Token field**
5. **Send request**

Or manually add header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Using Postman Variables

Save token from login response:
```
1. Login request
2. Tests tab:
   pm.environment.set("token", pm.response.json().token);
3. Use {{token}} in Authorization header
```

---

## 🚀 Quick Test Commands

Create file `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

# Register
echo "Registering user..."
REGISTER=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"quick@test.com",
    "password":"quicktest123",
    "name":"Quick Test"
  }')

echo $REGISTER
echo ""

# Login
echo "Logging in..."
LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@example.com",
    "password":"password"
  }')

TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""

# Get user data
echo "Getting user data..."
curl -s -X GET $BASE_URL/protected/user-data \
  -H "Authorization: Bearer $TOKEN" | json_pp

echo ""

# Try admin data
echo "Trying to get admin data..."
curl -s -X GET $BASE_URL/protected/admin-data \
  -H "Authorization: Bearer $TOKEN" | json_pp
```

Run with:
```bash
bash test-api.sh
```

---

## 🎯 Testing Checklist

- [ ] Register new user successfully
- [ ] Login with credentials returns token
- [ ] Access /user-data with token
- [ ] Access /manager-data with admin token (success)
- [ ] Access /manager-data with user token (403)
- [ ] Access /admin-data with admin token (success)
- [ ] Access /admin-data with user token (403)
- [ ] Get profile with valid token
- [ ] Try endpoints without token (401)
- [ ] Try with invalid token (401)
- [ ] Try with expired token (401 or 401)

---

**All endpoints are ready for testing!** 🎉
