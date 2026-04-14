require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Secure Authentication API Server', status: 'running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST   /api/auth/register - Register new user');
  console.log('  POST   /api/auth/login - Login user');
  console.log('  GET    /api/auth/profile - Get user profile (requires token)');
  console.log('  GET    /api/protected/user-data - Get user data (requires token)');
  console.log('  GET    /api/protected/manager-data - Get manager data (requires token + manager/admin role)');
  console.log('  GET    /api/protected/admin-data - Get admin data (requires token + admin role)');
});
