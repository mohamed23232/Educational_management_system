const Subject = require('../models/subject');
const Teacher = require('../models/teacher');
const Student = require('../models/student');

// Render create subject form
exports.renderCreateForm = async (req, res) => {
  if (req.session.user?.role !== 'admin') return res.status(403).send('Access denied');

  try {
    const teachers = await Teacher.find();
    const students = await Student.find();
    res.render('create_subject', { teachers, students });
    console.log('Create subject page rendered');
  } catch (err) {
    console.error('Error fetching teachers/students:', err);
    res.status(500).send('Error fetching subjects');
  }
};

// Handle subject creation
exports.createSubject = async (req, res) => {
  try {
    const { title, description, teacher, students } = req.body;

    if (!title || !teacher) {
      console.log(title);
      return res.status(400).send('Missing required fields');
    }

    const subject = new Subject({
      name: title,
      description,
      teacher,
      students,
    });

    await subject.save();
    res.redirect('/auth/admin_dashboard');
  } catch (err) {
    console.error('Error creating subject:', err);
    res.status(500).send('Error creating subject');
  }
};

// View all subjects
exports.viewSubjects = async (req, res) => {
  try {
    const user = req.session.user;
    const subjects = await Subject.find().populate('teacher', 'username');
    res.render('view_subject', { subjects, user });
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).send('Error fetching subjects');
  }
};

// View subject details
exports.viewSubjectDetails = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('students', 'username');
    if (!subject) return res.status(404).send('Subject not found');

    res.render('view_students', { subject });
  } catch (err) {
    console.error('Error fetching subject details:', err);
    res.status(500).send('Error fetching subject details');
  }
};
exports.renderEditForm = async (req, res) => {
  if (req.session.user?.role !== 'admin') return res.status(403).send('Access denied');

  try {
    const subject = await Subject.findById(req.params.id).populate('teacher').populate('students');
    const teachers = await Teacher.find();
    const students = await Student.find();

    if (!subject) {
      return res.status(404).send('Subject not found');
    }

    // Create a Set of assigned students
    const assignedStudents = new Set(subject.students.map(s => s._id.toString()));

    res.render('edit_subject', { subject, teachers, students, assignedStudents });
  } catch (err) {
    console.error('Error loading edit page:', err);
    res.status(500).send('Error loading edit page');
  }
};
// Handle subject update
exports.updateSubject = async (req, res) => {
  try {
    const { title, description, teacher, students } = req.body;

    if (!title || !teacher) {
      console.log(title);
      return res.status(400).send('Missing required fields');
    }

    await Subject.findByIdAndUpdate(req.params.id, {
      name: title,
      description,
      teacher,
      students,
    });

    res.redirect('/subject/view');
  } catch (err) {
    console.error('Error updating subject:', err);
    res.status(500).send('Error updating subject');
  }
};

// Handle subject deletion
exports.deleteSubject = async (req, res) => {
  if (req.session.user?.role !== 'admin') return res.status(403).send('Access denied');

  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).send('Subject not found');

    await Subject.findByIdAndDelete(req.params.id);

    res.redirect('/subject/view');
  } catch (err) {
    console.error('Error deleting subject:', err);
    res.status(500).send('Error deleting subject');
  }
};
