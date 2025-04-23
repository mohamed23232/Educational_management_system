const express = require('express');
const router = express.Router();
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Assignment = require('../models/assignment');
const Subject = require('../models/subject');
const bcrypt = require('bcrypt');

// Login Route
router.get('/login', (req, res) => {
    res.render('login');
    console.log('Login page rendered');
});

// Register Route
router.get('/register', (req, res) => {
    res.render('register');
})

// Handle Register for Teacher or Student
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body; // username instead of email

    if (role === 'teacher') {
        const existingTeacher = await Teacher.findOne({ username });
        if (existingTeacher) return res.send('Teacher with this username already exists.');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newTeacher = new Teacher({ username, password: hashedPassword });
        await newTeacher.save();
        res.redirect('/auth/login');
    } else if (role === 'student') {
        const existingStudent = await Student.findOne({ username });
        if (existingStudent) return res.send('Student with this username already exists.');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent = new Student({ username, password: hashedPassword });
        await newStudent.save();
        res.redirect('/auth/login');
    } else {
        res.send('Invalid role selected.');
    }
});

//Handle Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // username instead of email

    // Check if teacher
    let user = await Teacher.findOne({ username });
    if (user) {
        if (!(await bcrypt.compare(password, user.password))) {
            return res.send('Invalid credentials');
        }
        req.session.user = { id: user._id, name: user.username, role: 'teacher' };
        console.log("name", req.session.user.name);
        return res.redirect('/auth/teacher_dashboard');
    }

    // Check if student
    user = await Student.findOne({ username });
    if (user) {
        if (!(await bcrypt.compare(password, user.password))) {
            return res.send('Invalid credentials');
        }
        req.session.user = { id: user._id, name: user.username, role: 'student' };

        return res.redirect('/auth/student_dashboard');
    }

    res.send('No user found with this username.');
});

function ensureAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect('/auth/login');
}

// Student Dashboard
router.get('/student_dashboard', ensureAuthenticated, async (req, res) => {
    if (req.session.user.role !== 'student') {
        return res.status(403).send('Access denied');
    }

    try {
        // Retrieve the assignments related to the student (you might want to filter assignments for the specific student)
        const assignments = await Assignment.find({});

        // Render the dashboard and pass the user and assignments to the view
        console.log(req.session.user);
        res.render('student_dashboard', { user: req.session.user, assignments: assignments });
    } catch (err) {
        console.error('Error fetching assignments:', err);
        res.send('Error fetching assignments.');
    }
});


// Teacher Dashboard
router.get('/teacher_dashboard', ensureAuthenticated, async (req, res) => {
    if (req.session.user.role !== 'teacher') return res.status(403).send('Access denied');

    try {
        const assignments = await Assignment.find({ teacherId: req.session.user.id });
        res.render('teacher_dashboard', { user: req.session.user, assignments: assignments });
    } catch (err) {
        console.error('Error fetching assignments:', err);
        res.send('Error fetching assignments.');
    }
});




// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;
