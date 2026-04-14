const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Mock database - Replace with real database in production
const users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz', // hashed password
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz',
    role: 'user',
    name: 'Regular User'
  },
  {
    id: 3,
    email: 'manager@example.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz',
    role: 'manager',
    name: 'Manager User'
  }
];

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      role: 'user', // Default role
      name
    };

    users.push(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
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

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user profile
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Profile retrieved',
    user: req.user
  });
});

// Logout endpoint (client-side token removal is sufficient, but here for API completeness)
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
