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


module.exports = router;
