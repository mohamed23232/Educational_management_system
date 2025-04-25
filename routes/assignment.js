const express = require('express');
const router = express.Router();
const Assignment = require('../models/assignment');
const Subject = require('../models/subject');
const Submission = require('../models/submission');

// Render create assignment form
router.get('/create', async (req, res) => {
  if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');

  try {
    const teacherId = req.session.user.id; // Get teacher ID from session
    const subjects = await Subject.find({ teacher: teacherId }); // Fetch only assigned subjects
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

router.get('/view', async (req, res) => {
  try {
    const userId = req.session.user.id;

    if (req.session.user?.role === 'teacher') {
      // Teacher logic — unchanged
      const subjects = await Subject.find({ teacher: userId }).select('_id');
      const subjectIds = subjects.map(subject => subject._id);
      const assignments = await Assignment.find({ subject: { $in: subjectIds } }).populate('subject');

      return res.render('view_assignment', {
        assignments,
        userRole: 'teacher'
      });
    }

    if (req.session.user?.role === 'student') {
      // Student logic — enhanced
      const subjects = await Subject.find({ students: userId }).select('_id');
      const subjectIds = subjects.map(subject => subject._id);

      const allAssignments = await Assignment.find({ subject: { $in: subjectIds } }).populate('subject');

      const submissions = await Submission.find({ student: userId })
        .populate({
          path: 'assignment',
          populate: { path: 'subject' }
        });

      const submittedAssignmentIds = new Set(submissions.map(s => s.assignment?._id?.toString()));

      const submittedAssignments = [];
      const notSubmittedAssignments = [];

      // Loop through all assignments and categorize them
      allAssignments.forEach(assignment => {
        if (submittedAssignmentIds.has(assignment._id.toString())) {
          const sub = submissions.find(s => s.assignment?._id?.toString() === assignment._id.toString());
          if (sub) {
            submittedAssignments.push({ assignment, submission: sub });
          }
        } else {
          notSubmittedAssignments.push(assignment);
        }
      });

      return res.render('view_assignment', {
        userRole: 'student',
        submittedAssignments,
        notSubmittedAssignments
      });
    }

    res.status(403).send('Unauthorized role');
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


router.get('/edit/:id', async (req, res) => {
  if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');

  try {
    const assignment = await Assignment.findById(req.params.id);
    const subjects = await Subject.find({ teacher: req.session.user.id });

    if (!assignment) return res.status(404).send('Assignment not found');

    res.render('edit_assignment', { assignment, subjects });
  } catch (err) {
    console.error('Error loading edit page:', err);
    res.status(500).send('Error loading edit page');
  }
});

// Handle assignment update
router.post('/edit/:id', async (req, res) => {
  try {
    const { title, description, dueDate, subject } = req.body;

    if (!title || !dueDate || !subject) {
      return res.status(400).send('Missing required fields');
    }

    await Assignment.findByIdAndUpdate(req.params.id, {
      title,
      description,
      dueDate: new Date(dueDate),
      subject
    });

    res.redirect('/assignment/view');
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).send('Error updating assignment');
  }
});

router.post('/delete/:id', async (req, res) => {
  if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');

  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.redirect('/assignment/view');
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).send('Error deleting assignment');
  }
});

// view assignment details
router.get('/details/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('subject');
    if (!assignment) return res.status(404).send('Assignment not found');
    res.render('assignment_details', { assignment });
  } catch (err) {
    console.error('Error fetching assignment details:', err);
    res.status(500).send('Error fetching assignment details');
  }
});



module.exports = router;
