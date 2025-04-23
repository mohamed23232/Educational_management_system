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

  try {
    // fetch all assignments based on the subjects the teacher is teaching

    const teacherId = req.session.user.id;

    // Step 1: Get the subjects the teacher teaches
    const subjects = await Subject.find({ teacher: teacherId }).select('_id');
    const subjectIds = subjects.map(subject => subject._id);

    // Step 2: Get assignments linked to those subjects
    const assignments = await Assignment.find({ subject: { $in: subjectIds } }).populate('subject');
    console.log('Assignments fetched:', assignments);

    console.log('Assignments fetched:', assignments);
    if (req.session.user?.role == 'teacher')res.render('view_assignment', { assignments, userRole: 'teacher' });
    if (req.session.user?.role == 'student')res.render('view_assignment', { assignments, userRole: 'student' });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).send('Error fetching assignments');
  }
});


module.exports = router;
