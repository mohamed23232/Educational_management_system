const express = require('express');
const router = express.Router();
const Assignment = require('../models/assignment');
const Subject = require('../models/subject');

// Render create assignment form
router.get('/create', async (req, res) => {
  if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');

  try {
    const subjects = await Subject.find();
    res.render('create_assignment', { subjects });
    console.log('Create assignment page rendered');
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).send('Error fetching subjects');
  }
});

// Handle assignment creation
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, subject } = req.body;

    if (!title || !dueDate || !subject) {
      return res.status(400).send('Missing required fields');
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate: new Date(dueDate),
      subject,
      teacherId: req.session.user.id
    });

    await assignment.save();
    res.redirect('/auth/teacher_dashboard');
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).send('Error creating assignment');
  }
});

// ✅ New route: View all assignments for teachers (linked from dashboard)
router.get('/view', async (req, res) => {
  if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');

  try {
    const assignments = await Assignment.find();
    console.log('Assignments fetched:', assignments);
    res.render('view_assignment', { assignments, userRole: 'teacher' });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).send('Error fetching assignments');
  }
});


module.exports = router;
