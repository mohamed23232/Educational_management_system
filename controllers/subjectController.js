const Subject = require('../models/subject');
const Teacher = require('../models/teacher');
const Student = require('../models/student');

// Render create subject form
exports.renderCreateForm = async (req, res) => {
  const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
  if (req.session.user?.role !== 'admin') {
    const message = "Access Denied. Only admins can access this page.";
    const statusCode = 403;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }

  try {
    const teachers = await Teacher.find();
    const students = await Student.find();
    res.render('create_subject', { teachers, students });
    console.log('Create subject page rendered');
  } catch (err) {
    console.error('Error fetching teachers/students:', err);
    const message = "Error fetching teachers or students.";
    const statusCode = 500;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }
};

// Handle subject creation
exports.createSubject = async (req, res) => {
  const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
  try {
    const { title, description, teacher, students } = req.body;

    if (!title || !teacher) {
      console.log(title);
      const message = "Missing required fields";
      const statusCode = 400;
      return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
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
    const message = "Error creating subject";
    const statusCode = 500;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }
};

// View all subjects
exports.viewSubjects = async (req, res) => {
  const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
  try {
    const user = req.session.user;
    const subjects = await Subject.find().populate('teacher', 'username');
    res.render('view_subject', { subjects, user });
  } catch (err) {
    console.error('Error fetching subjects:', err);
    const message = "Error fetching subjects";
    const statusCode = 500;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }
};

// View subject details
exports.viewSubjectDetails = async (req, res) => {
  const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
  try {
    const subject = await Subject.findById(req.params.id).populate('students', 'username');
    if (!subject) {
      const message = "Subject not found";
      const statusCode = 404;
      return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }

    res.render('view_students', { subject });
  } catch (err) {
    console.error('Error fetching subject details:', err);
    const message = "Error fetching subject details";
    const statusCode = 500;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }
};

// Render edit subject form
exports.renderEditForm = async (req, res) => {
  const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
  if (req.session.user?.role !== 'admin') {
    const message = "Access Denied. Only admins can access this page.";
    const statusCode = 403;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }

  try {
    const subject = await Subject.findById(req.params.id).populate('teacher');
    const teachers = await Teacher.find();
    const students = await Student.find();

    if (!subject) {
      const message = "Subject not found";
      const statusCode = 404;
      return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }

    res.render('edit_subject', { subject, teachers, students });
  } catch (err) {
    console.error('Error loading edit page:', err);
    const message = "Error loading edit page";
    const statusCode = 500;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }
};

// Handle subject update
exports.updateSubject = async (req, res) => {
  const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
  try {
    const { title, description, teacher, students } = req.body;

    if (!title || !teacher) {
      console.log(title);
      const message = "Missing required fields";
      const statusCode = 400;
      return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
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
    const message = "Error updating subject";
    const statusCode = 500;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }
};

// Handle subject deletion
exports.deleteSubject = async (req, res) => {
  const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
  if (req.session.user?.role !== 'admin') {
    const message = "Access Denied. Only admins can access this page.";
    const statusCode = 403;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }

  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      const message = "Subject not found";
      const statusCode = 404;
      return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.redirect('/subject/view');
  } catch (err) {
    console.error('Error deleting subject:', err);
    const message = "Error deleting subject";
    const statusCode = 500;
    return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
  }
};