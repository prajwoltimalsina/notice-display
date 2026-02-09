const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware, superAdminMiddleware } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/profile (protected)
router.get('/profile', authMiddleware, authController.getProfile);

// Admin management routes (protected, super admin only)
// GET /api/auth/pending-approvals - Get all pending admin approvals
router.get('/admin/pending-approvals', authMiddleware, superAdminMiddleware, adminController.getPendingApprovals);

// GET /api/auth/approved-admins - Get all approved admins
router.get('/admin/approved-admins', authMiddleware, superAdminMiddleware, adminController.getApprovedAdmins);

// GET /api/auth/users - Get all users with optional role filter
router.get('/admin/users', authMiddleware, superAdminMiddleware, adminController.getAllUsers);

// PATCH /api/auth/admin/:adminId/approve - Approve admin account
router.patch('/admin/:adminId/approve', authMiddleware, superAdminMiddleware, adminController.approveAdmin);

// PATCH /api/auth/admin/:adminId/reject - Reject admin account
router.patch('/admin/:adminId/reject', authMiddleware, superAdminMiddleware, adminController.rejectAdmin);

// PATCH /api/auth/admin/:adminId/remove - Remove admin privileges
router.patch('/admin/:adminId/remove', authMiddleware, superAdminMiddleware, adminController.removeAdmin);

module.exports = router;
