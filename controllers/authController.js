const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Assignment = require('../models/assignment');
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');

exports.renderLogin = (req, res) => {
    // Ensure any existing session is destroyed before rendering login page
    if (req.session.user) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                const message = "Error logging out.";
                const statusCode = 500;
                return res.status(statusCode).render('error_page', { redirectTo: '/auth/login', message, statusCode });
            }
            res.render('login');
        });
    } else {
        res.render('login');
    }
};

exports.renderRegister = (req, res) => {
    res.render('register');
};

exports.registerUser = async (req, res) => {
    const redirectTo = '/auth/login';
    const { username, password, role } = req.body;

    try {
        // Check if username already exists in any collection (Teacher, Student, Admin)
        const existingTeacher = await Teacher.findOne({ username });
        const existingStudent = await Student.findOne({ username });
        const existingAdmin = await Admin.findOne({ username });

        if (existingTeacher || existingStudent || existingAdmin) {
            const message = "Username already exists for another role. Please choose a different username.";
            const statusCode = 400;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }

        // Validate role
        if (!['teacher', 'student', 'admin'].includes(role)) {
            const message = "Invalid role selected.";
            const statusCode = 400;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user based on the role
        if (role === 'teacher') {
            const newTeacher = new Teacher({ username, password: hashedPassword });
            await newTeacher.save();
            return res.redirect('/auth/login');
        }

        if (role === 'student') {
            const newStudent = new Student({ username, password: hashedPassword });
            await newStudent.save();
            return res.redirect('/auth/login');
        }

        if (role === 'admin') {
            const newAdmin = new Admin({ username, password: hashedPassword });
            await newAdmin.save();
            return res.redirect('/auth/login');
        }
    } catch (err) {
        console.error('Error during registration:', err);
        const message = "Registration error.";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

exports.loginUser = async (req, res) => {
    const redirectTo = '/auth/login';
    const { username, password } = req.body;

    try {
        let user = await Teacher.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user._id, name: user.username, role: 'teacher' };
            console.log("Logged in:", req.session.user.name);
            return res.redirect('/auth/teacher_dashboard');
        }

        user = await Student.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user._id, name: user.username, role: 'student' };
            return res.redirect('/auth/student_dashboard');
        }

        user = await Admin.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user._id, name: user.username, role: 'admin' };
            return res.redirect('/auth/admin_dashboard');
        }

        const message = "Invalid credentials or no user found.";
        const statusCode = 401;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    } catch (err) {
        console.error('Login error:', err);
        const message = "Login error.";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

exports.ensureAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    const message = "Please log in to access this page.";
    const statusCode = 401;
    return res.status(statusCode).render('error_page', { redirectTo: '/auth/login', message, statusCode });
};

exports.studentDashboard = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    if (req.session.user.role !== 'student') {
        const message = "Access denied. Only students can access this page.";
        const statusCode = 403;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }

    try {
        const assignments = await Assignment.find({});
        res.render('student_dashboard', { user: req.session.user, assignments });
    } catch (err) {
        console.error('Error fetching student assignments:', err);
        const message = "Error fetching assignments.";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

exports.teacherDashboard = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    if (req.session.user.role !== 'teacher') {
        const message = "Access denied. Only teachers can access this page.";
        const statusCode = 403;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }

    try {
        const assignments = await Assignment.find({ teacherId: req.session.user.id });
        res.render('teacher_dashboard', { user: req.session.user, assignments });
    } catch (err) {
        console.error('Error fetching teacher assignments:', err);
        const message = "Error fetching assignments.";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

exports.adminDashboard = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    if (req.session.user.role !== 'admin') {
        const message = "Access denied. Only admins can access this page.";
        const statusCode = 403;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }

    try {
        res.render('admin_dashboard', { user: req.session.user });
    } catch (err) {
        console.error('Error fetching admin data:', err);
        const message = "Error fetching admin dashboard.";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            const message = "Error logging out.";
            const statusCode = 500;
            return res.status(statusCode).render('error_page', { redirectTo: '/auth/login', message, statusCode });
        }
        res.redirect('/auth/login');
    });
};