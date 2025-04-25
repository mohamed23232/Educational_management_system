const express = require('express');
const router = express.Router();
// const Subject = require('../models/subject');
const Subject = require('../models/subject');
const Teacher = require('../models/teacher');
const Student = require('../models/student');

// Render create subject form
router.get('/create', async (req, res) => {
  if (req.session.user?.role !== 'admin') return res.status(403).send('Access denied');

  try {
    const teachers = await Teacher.find();
    const students = await Student.find();
    res.render('create_subject', { teachers, students });
    console.log('Create subject page rendered');
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).send('Error fetching subjects');
  }
});

// Handle subject creation
router.post('/', async (req, res) => {
  try {
    const { title, description, teacher, students } = req.body;

    if (!title || !teacher) {
      console.log(title);
      return res.status(400).send('Missing required fields', title);
    }
    //console.log(title)
    const subject = new Subject({
      name: title,
      description: description,
      teacher: teacher,
      students: students,
    });

    await subject.save();
    res.redirect('/auth/admin_dashboard');
  } catch (err) {
    console.error('Error creating subject:', err);
    res.status(500).send('Error creating subject');
  }
});

// ✅ New route: View all subjects for teachers (linked from dashboard)
router.get('/view', async (req, res) => {

  try {
    // fetch all subjects based on the subjects the teacher is teaching
    const user = req.session.user;
    const subjects = await Subject.find().populate('teacher', 'username');
    res.render('view_subject', { subjects, user });

    // console.log('Subjects fetched:', subjects);
    // res.render('view_subject', { subjects });
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).send('Error fetching subjects');
  }
});


// view assignment details
router.get('/details/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('students', 'username');
    if (!subject) return res.status(404).send('Subject not found');

    res.render('students_list', { subject });
  } catch (err) {
    console.error('Error fetching assignment details:', err);
    res.status(500).send('Error fetching assignment details');
  }
});

// Edit Subject (GET route)
router.get('/edit/:id', async (req, res) => {
  // Ensure the user is an admin
  if (req.session.user?.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  try {
    // Find the subject by its ID
    const subject = await Subject.findById(req.params.id).populate('teacher');
    const teachers = await Teacher.find(); // Get all teachers for the dropdown
    const students = await Student.find();

    if (!subject) {
      return res.status(404).send('Subject not found');
    }

    // Render the 'edit_subject' page with subject and teachers data
    res.render('edit_subject', { subject, teachers,students });
  } catch (err) {
    console.error('Error loading edit page:', err);
    res.status(500).send('Error loading edit page');
  }
});

// Handle subject update (POST route)
router.post('/edit/:id', async (req, res) => {
  try {
    const { title, description, teacher, students } = req.body;

    if (!title || !teacher) {
        console.log(title);
      return res.status(400).send('Missing required fields',title);
    }

    await Subject.findByIdAndUpdate(req.params.id, {
      name: title,
      description,
      teacher,
      students
    });


    res.redirect('/subject/view');
  } catch (err) {
    console.error('Error creating subject:', err);
    res.status(500).send('Error creating subject');
  }
});
router.post('/delete/:id', async (req, res) => {
  if (req.session.user?.role !== 'admin') return res.status(403).send('Access denied');

  try {
    // Find the subject by ID
    const subject = await Subject.findById(req.params.id).populate('students');

    if (!subject) return res.status(404).send('Subject not found');

    // Loop over each assignment associated with the subject and delete them
    // Assuming the assignments are associated with the subject
    //await Assignment.deleteMany({ subject: req.params.id });

    // Delete the subject itself
    await Subject.findByIdAndDelete(req.params.id);

    // Redirect to the assignments view page
    res.redirect('/subject/view');
  } catch (err) {
    console.error('Error deleting assignment or subject:', err);
    res.status(500).send('Error deleting assignment or subject');
  }
});

module.exports = router;
