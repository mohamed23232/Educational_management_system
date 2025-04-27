const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login Routes
router.get('/login', authController.renderLogin);
router.post('/login', authController.loginUser);

// Register Routes
router.get('/register', authController.renderRegister);
router.post('/register', authController.registerUser);

// Dashboards
router.get('/student_dashboard', authController.ensureAuthenticated, authController.studentDashboard);
router.get('/teacher_dashboard', authController.ensureAuthenticated, authController.teacherDashboard);
router.get('/admin_dashboard', authController.ensureAuthenticated, authController.adminDashboard);

// Logout
router.get('/logout', authController.logoutUser);

module.exports = router;
