const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Assignment = require('../models/assignment');
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');

exports.renderLogin = (req, res) => {
    // I need to logout any user before rendering the login page
    if (req.session.user) {
        req.session.destroy(() => {
            console.log('User logged out before rendering login page');
        });
    }
    res.render('login');
    console.log('Login page rendered');
};

exports.renderRegister = (req, res) => {
    res.render('register');
};

exports.registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        if (role === 'teacher') {
            const existingTeacher = await Teacher.findOne({ username });
            if (existingTeacher) return res.send('Teacher with this username already exists.');

            const hashedPassword = await bcrypt.hash(password, 10);
            const newTeacher = new Teacher({ username, password: hashedPassword });
            await newTeacher.save();
            return res.redirect('/auth/login');
        }

        if (role === 'student') {
            const existingStudent = await Student.findOne({ username });
            if (existingStudent) return res.send('Student with this username already exists.');

            const hashedPassword = await bcrypt.hash(password, 10);
            const newStudent = new Student({ username, password: hashedPassword });
            await newStudent.save();
            return res.redirect('/auth/login');
        }

        if (role === 'admin') {
            const existingAdmin = await Admin.findOne({ username });
            if (existingAdmin) return res.send('Admin with this username already exists.');

            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = new Admin({ username, password: hashedPassword });
            await newAdmin.save();
            return res.redirect('/auth/login');
        }

        res.send('Invalid role selected.');
    } catch (err) {
        console.error('Error during registration:', err);
        res.send('Registration error.');
    }
};

exports.loginUser = async (req, res) => {
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

        res.send('Invalid credentials or no user found.');
    } catch (err) {
        console.error('Login error:', err);
        res.send('Login error.');
    }
};

exports.ensureAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/auth/login');
};

exports.studentDashboard = async (req, res) => {
    if (req.session.user.role !== 'student') {
        return res.status(403).send('Access denied');
    }

    try {
        const assignments = await Assignment.find({});
        res.render('student_dashboard', { user: req.session.user, assignments });
    } catch (err) {
        console.error('Error fetching student assignments:', err);
        res.send('Error fetching assignments.');
    }
};

exports.teacherDashboard = async (req, res) => {
    if (req.session.user.role !== 'teacher') {
        return res.status(403).send('Access denied');
    }

    try {
        const assignments = await Assignment.find({ teacherId: req.session.user.id });
        res.render('teacher_dashboard', { user: req.session.user, assignments });
    } catch (err) {
        console.error('Error fetching teacher assignments:', err);
        res.send('Error fetching assignments.');
    }
};

exports.adminDashboard = async (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }

    try {
        res.render('admin_dashboard', { user: req.session.user });
    } catch (err) {
        console.error('Error fetching admin data:', err);
        res.send('Error fetching admin dashboard.');
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};
