const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./db');

const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const subjectRoutes = require('./routes/subject');
const assignmentRoutes = require('./routes/assignment');
const submissionRoutes = require('./routes/submission');
const authRoutes = require('./routes/auth'); // <-- Add auth routes

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
connectDB();

// Session setup
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
    }),
}));

// Routes
// app.use('/teacher', teacherRoutes);
// app.use('/student', studentRoutes);
// app.use('/subject', subjectRoutes);
app.use('/assignment', assignmentRoutes);
//app.use('/submission', submissionRoutes);
app.use('/auth', authRoutes); // <-- Auth routes (login/register/dashboard/etc.)

app.get('/', (req, res) => res.redirect('/auth/login'));



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});