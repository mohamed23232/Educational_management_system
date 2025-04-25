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

// ✅ New route: View all assignments for teachers and students
router.get('/view', async (req, res) => {

  try {
    const userId = req.session.user.id;
    let assignments;

    if (req.session.user?.role === 'teacher') {
      // Step 1: Get the subjects the teacher teaches
      const subjects = await Subject.find({ teacher: userId }).select('_id');
      const subjectIds = subjects.map(subject => subject._id);

      // Step 2: Get assignments linked to those subjects
      assignments = await Assignment.find({ subject: { $in: subjectIds } }).populate('subject');
    } else if (req.session.user?.role === 'student') {
      // Step 1: Get the subjects the student is enrolled in
      const subjects = await Subject.find({ students: userId }).select('_id');
      const subjectIds = subjects.map(subject => subject._id);

      // Step 2: Get assignments linked to those subjects
      assignments = await Assignment.find({ subject: { $in: subjectIds } }).populate('subject');
    }

    console.log('Assignments fetched:', assignments);

    // Render assignments based on the role
    res.render('view_assignment', { assignments, userRole: req.session.user.role });

  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).send('Error fetching assignments');
  }
});
// Route to show assignment details (for both teachers and students)
router.get('/details/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('subject');
    const userRole = req.session.user?.role;

    if (!assignment) {
      return res.status(404).send('Assignment not found');
    }

    res.render('assignment_details', {
      assignment,
      userRole,
      userId: req.session.user?.id
    });
  } catch (err) {
    console.error('Error fetching assignment details:', err);
    res.status(500).send('Internal server error');
  }
});



module.exports = router;
