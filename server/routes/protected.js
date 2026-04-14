const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Route accessible by all authenticated users
router.get('/user-data', verifyToken, (req, res) => {
  res.json({
    message: 'User data retrieved',
    data: {
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      content: 'This is accessible to all authenticated users'
    }
  });
});

// Route accessible only by managers and admins
router.get('/manager-data', verifyToken, checkRole(['manager', 'admin']), (req, res) => {
  res.json({
    message: 'Manager data retrieved',
    data: {
      managerId: req.user.id,
      managerName: req.user.name,
      content: 'This is accessible to managers and admins only',
      reportData: {
        totalUsers: 150,
        activeUsers: 120,
        inactiveUsers: 30
      }
    }
  });
});

// Route accessible only by admins
router.get('/admin-data', verifyToken, checkRole(['admin']), (req, res) => {
  res.json({
    message: 'Admin data retrieved',
    data: {
      adminId: req.user.id,
      adminName: req.user.name,
      content: 'This is accessible to admins only',
      systemData: {
        totalSessions: 500,
        systemHealth: '99.9%',
        lastBackup: new Date().toISOString()
      }
    }
  });
});

// Example: Update user (admin only)
router.put('/users/:id', verifyToken, checkRole(['admin']), (req, res) => {
  const { id } = req.params;
  res.json({
    message: 'User updated successfully',
    userId: id,
    updatedBy: req.user.email
  });
});

// Example: Delete user (admin only)
router.delete('/users/:id', verifyToken, checkRole(['admin']), (req, res) => {
  const { id } = req.params;
  res.json({
    message: 'User deleted successfully',
    userId: id,
    deletedBy: req.user.email
  });
});

module.exports = router;
