const Submission = require('../models/submission');
const Assignment = require('../models/assignment');

// Handle assignment submission
exports.submitAssignment = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    const { assignmentId } = req.params;
    const { content } = req.body;

    try {
        if (!content) {
            console.error('Content is missing');
            const message = "Content is required";
            const statusCode = 400;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }

        if (!req.session.user || !req.session.user.id) {
            console.error('User not logged in');
            const message = "You must be logged in to submit an assignment.";
            const statusCode = 403;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }

        const studentId = req.session.user.id;
        console.log('Logged-in user ID:', studentId);

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            console.error(`Assignment with ID ${assignmentId} not found`);
            const message = "Assignment not found";
            const statusCode = 404;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }

        const existingSubmission = await Submission.findOne({
            assignment: assignmentId,
            student: studentId,
        });

        if (existingSubmission) {
            console.warn('Duplicate submission attempt by student:', studentId);
            const message = "You have already submitted this assignment.";
            const statusCode = 409;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
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
        const message = "Internal Server Error";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};