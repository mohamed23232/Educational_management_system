const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./db');


const subjectRoutes = require('./routes/subject');
const assignmentRoutes = require('./routes/assignment');
const submissionRoutes = require('./routes/submission');
const authRoutes = require('./routes/auth'); // <-- Add auth routes
const error = require('./routes/error'); // <-- Error routes

const app = express();
app.use(express.static('public'));

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

app.use('/subject', subjectRoutes);
app.use('/assignment', assignmentRoutes);
app.use('/submission', submissionRoutes);
app.use('/auth', authRoutes); // <-- Auth routes (login/register/dashboard/etc.)
app.get('/', (req, res) => res.redirect('/auth/login'));
// Handle 404 - Page Not Found
app.use(error);






app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:3000');
});