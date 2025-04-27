const Submission = require('../models/submission');
const Assignment = require('../models/assignment');

// Handle assignment submission
exports.submitAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const { content } = req.body;

    try {
        if (!content) {
            console.error('Content is missing');
            return res.status(400).send('Content is required');
        }

        if (!req.session.user || !req.session.user.id) {
            console.error('User not logged in');
            return res.status(403).send('You must be logged in to submit an assignment.');
        }

        const studentId = req.session.user.id;
        console.log('Logged-in user ID:', studentId);

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            console.error(`Assignment with ID ${assignmentId} not found`);
            return res.status(404).send('Assignment not found');
        }

        const existingSubmission = await Submission.findOne({
            assignment: assignmentId,
            student: studentId,
        });

        if (existingSubmission) {
            console.warn('Duplicate submission attempt by student:', studentId);
            return res.status(409).send('You have already submitted this assignment.');
        }

        const submission = new Submission({
            assignment: assignmentId,
            student: studentId,
            content,
            submitted: true,
            submissionDate: new Date(),
        });

        await submission.save();

        if (!Array.isArray(assignment.submissions)) {
            assignment.submissions = [];
        }

        assignment.submissions.push(submission._id);
        await assignment.save();

        console.log('Assignment submitted successfully:', submission._id);

        res.redirect('/assignment/view');
    } catch (err) {
        console.error('Error submitting assignment:', err);
        res.status(500).send('Internal Server Error');
    }
};
