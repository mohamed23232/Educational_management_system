const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// POST route for submitting an assignment
router.post('/:assignmentId', submissionController.submitAssignment);

module.exports = router;
