const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// Create subject routes
router.get('/create', subjectController.renderCreateForm);
router.post('/', subjectController.createSubject);

// View subjects
router.get('/view', subjectController.viewSubjects);

// View subject details
router.get('/details/:id', subjectController.viewSubjectDetails);

// Edit subject routes
router.get('/edit/:id', subjectController.renderEditForm);
router.post('/edit/:id', subjectController.updateSubject);

// Delete subject
router.post('/delete/:id', subjectController.deleteSubject);

module.exports = router;
