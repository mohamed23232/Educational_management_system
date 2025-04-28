const Assignment = require('../models/assignment');
const Subject = require('../models/subject');
const Submission = require('../models/submission');
// Render create assignment form
exports.renderCreateForm = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;  
    console.log(req.session.user); 

    // Check if user is not authenticated or not a teacher
    if (!req.session.user || req.session.user.role !== 'teacher') {
        const message = "Access Denied. Only teachers can access this page.";
        const statusCode = 403;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }

    try {
        const teacherId = req.session.user.id;
        const subjects = await Subject.find({ teacher: teacherId });
        res.render('create_assignment', { subjects });
        console.log('Create assignment page rendered');
    } catch (err) {
        console.error('Error fetching subjects:', err);
        const message = 'Internal Server Error while fetching subjects.';
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};


// Handle assignment creation
exports.createAssignment = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    try {
        const { title, description, dueDate, subject } = req.body;
        if (!title || !dueDate || !subject) {
            const message = "Missing required fields";
            const statusCode = 400;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }
        const assignment = new Assignment({
            title,
            description,
            dueDate: new Date(dueDate),
            subject,
            teacherId: req.session.user.id
        });
        await assignment.save();
        res.redirect('/auth/teacher_dashboard');
    } catch (err) {
        console.error('Error creating assignment:', err);
        const message = "Error creating assignment";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

// View assignments
exports.viewAssignments = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    try {
        const userId = req.session.user.id;
        const currentDate = new Date();

        if (req.session.user?.role === 'teacher') {
            const subjects = await Subject.find({ teacher: userId }).select('_id');
            const subjectIds = subjects.map(subject => subject._id);
            const assignments = await Assignment.find({ subject: { $in: subjectIds } }).populate('subject');
            return res.render('view_assignment', { assignments, userRole: 'teacher' });
        }

        if (req.session.user?.role === 'student') {
            const subjects = await Subject.find({ students: userId }).select('_id');
            const subjectIds = subjects.map(subject => subject._id);
            const allAssignments = await Assignment.find({ subject: { $in: subjectIds } }).populate('subject');
            const submissions = await Submission.find({ student: userId }).populate({ path: 'assignment', populate: { path: 'subject' } });
            const submittedAssignmentIds = new Set(submissions.map(s => s.assignment?._id?.toString()));

            const pendingAssignments = [];
            const pastDueAssignments = [];
            const submittedAssignments = [];

            allAssignments.forEach(assignment => {
                const isDeadlinePassed = currentDate > new Date(assignment.dueDate);
                if (submittedAssignmentIds.has(assignment._id.toString())) {
                    const sub = submissions.find(s => s.assignment?._id?.toString() === assignment._id.toString());
                    if (sub) submittedAssignments.push({ assignment, submission: sub, isDeadlinePassed });
                } else if (isDeadlinePassed) {
                    pastDueAssignments.push(assignment);
                } else {
                    pendingAssignments.push(assignment);
                }
            });

            return res.render('view_assignment', {
                userRole: 'student',
                submittedAssignments,
                pendingAssignments,
                pastDueAssignments
            });
        }

        const message = "Unauthorized role";
        const statusCode = 403;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    } catch (err) {
        console.error('Error fetching assignments:', err);
    }
};

// Render edit assignment page
exports.renderEditForm = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    if (req.session.user?.role !== 'teacher'){
        const message = "Access Denied. Only teachers can access this page.";
        const statusCode = 403;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
    try {
        const assignment = await Assignment.findById(req.params.id);
        const subjects = await Subject.find({ teacher: req.session.user.id });
        if (!assignment){
            const message = "Assignment not found";
            const statusCode = 404;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }
        res.render('edit_assignment', { assignment, subjects });
    } catch (err) {
        console.error('Error loading edit page:', err);
        res.status(500).send('Error loading edit page');
    }
};

// Handle assignment update
exports.updateAssignment = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    try {
        const { title, description, dueDate, subject } = req.body;
        if (!title || !dueDate || !subject) {
            const message = "Missing required fields";
            const statusCode = 400;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }
        await Assignment.findByIdAndUpdate(req.params.id, {
            title,
            description,
            dueDate: new Date(dueDate),
            subject
        });
        res.redirect('/assignment/view');
    } catch (err) {
        console.error('Error updating assignment', err);
        const message = "Error updating assignment";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

// Handle assignment deletion
exports.deleteAssignment = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    if (req.session.user?.role !== 'teacher'){
        const message = "Access Denied. Only teachers can access this page.";
        const statusCode = 403;
        // Return to stop further code execution
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.redirect('/assignment/view');
    } catch (err) {
        console.error('Error deleting assignment:', err);
        const message = "Error deleting assignment";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

// Show assignment details
exports.viewAssignmentDetails = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    try {
        const assignment = await Assignment.findById(req.params.id).populate('subject');
        if (!assignment) {
            const message = "Assignment not found";
            const statusCode = 404;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }
        res.render('assignment_details', {
            assignment,
            userRole: req.session.user?.role,
            userId: req.session.user?.id
        });
    } catch (err) {
        console.error('Error fetching assignment details:', err);
        const message = "Internal server error";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

// View all submissions for a specific assignment
exports.viewSubmissions = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    if (req.session.user?.role !== 'teacher'){
        const message = "Access denied";
        const statusCode = 403;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
    try {
        const submissions = await Submission.find({ assignment: req.params.assignmentId })
            .populate('student')
            .populate('assignment');
        res.render('view_submissions', { submissions });
    } catch (err) {
        console.error('Error fetching submissions:', err);
        const message = "Error fetching submissions";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};

// Render page to grade a submission
exports.renderGradeForm = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    try {
        // Fetch the submission along with the student and assignment details
        const submission = await Submission.findById(req.params.id)
            .populate('student')
            .populate('assignment'); // Populate the assignment data

        if (!submission) {
            const message = "Submission not found";
            const statusCode = 404;
            return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
        }

        // Fetch the assignment data for the link back to submissions page
        const assignment = submission.assignment;

        // Render the grade form and pass both submission and assignment data
        res.render('grade_submission', { 
            submission,
            assignment // Pass the assignment object
        });
    } catch (err) {
        console.error('Error loading submission:', err);
        const message = "Failed to load submission.";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};


// Submit the grade and feedback
exports.submitGrade = async (req, res) => {
    const redirectTo = `/auth/${req.session.user?.role}_dashboard`;
    try {
        const { grade, feedback } = req.body;
        await Submission.findByIdAndUpdate(req.params.id, { grade, feedback });
        res.redirect('/assignment/view');
    } catch (err) {
        console.error('Error submitting grade:', err);
        const message = "Failed to submit grade";
        const statusCode = 500;
        return res.status(statusCode).render('error_page', { redirectTo, message, statusCode });
    }
};
