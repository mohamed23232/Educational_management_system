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
    res.render('create_subject', { teachers , students});
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
      return res.status(400).send('Missing required fields',title);
    }
    //console.log(title)
    const subject = new Subject({
      name:title,
      description:description,
      teacher: teacher,
      students:students,
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
    if (req.session.user?.role !== 'admin') return res.status(403).send('Access denied');
    const subjects = await Subject.find().populate('teacher', 'username');
    res.render('view_subject', { subjects });

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


// router.get('/edit/:id', async (req, res) => {
//   if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');

//   try {
//     const assignment = await Assignment.findById(req.params.id);
//     const subjects = await Subject.find({ teacher: req.session.user.id });

//     if (!assignment) return res.status(404).send('Assignment not found');

//     res.render('edit_assignment', { assignment, subjects });
//   } catch (err) {
//     console.error('Error loading edit page:', err);
//     res.status(500).send('Error loading edit page');
//   }
// });

// // Handle assignment update
// router.post('/edit/:id', async (req, res) => {
//   try {
//     const { title, description, dueDate, subject } = req.body;

//     if (!title || !dueDate || !subject) {
//       return res.status(400).send('Missing required fields');
//     }

//     await Assignment.findByIdAndUpdate(req.params.id, {
//       title,
//       description,
//       dueDate: new Date(dueDate),
//       subject
//     });

//     res.redirect('/assignment/view');
//   } catch (err) {
//     console.error('Error updating assignment:', err);
//     res.status(500).send('Error updating assignment');
//   }
// });

// router.post('/delete/:id', async (req, res) => {
//   if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');

//   try {
//     await Assignment.findByIdAndDelete(req.params.id);
//     res.redirect('/assignment/view');
//   } catch (err) {
//     console.error('Error deleting assignment:', err);
//     res.status(500).send('Error deleting assignment');
//   }
// });

module.exports = router;
