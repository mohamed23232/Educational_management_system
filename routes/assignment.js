const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// Routes
router.get('/create', assignmentController.renderCreateForm);
router.post('/', assignmentController.createAssignment);
router.get('/view', assignmentController.viewAssignments);
router.get('/edit/:id', assignmentController.renderEditForm);
router.post('/edit/:id', assignmentController.updateAssignment);
router.post('/delete/:id', assignmentController.deleteAssignment);
router.get('/details/:id', assignmentController.viewAssignmentDetails);
router.get('/view_submission/:assignmentId', assignmentController.viewSubmissions);
router.get('/grade/:id', assignmentController.renderGradeForm);
router.post('/grade/:id', assignmentController.submitGrade);

module.exports = router;
