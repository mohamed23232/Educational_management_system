const Assignment = require('../models/assignment');
const Subject = require('../models/subject');
const Submission = require('../models/submission');

// Render create assignment form
exports.renderCreateForm = async (req, res) => {
    if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');
    try {
        const teacherId = req.session.user.id;
        const subjects = await Subject.find({ teacher: teacherId });
        res.render('create_assignment', { subjects });
        console.log('Create assignment page rendered');
    } catch (err) {
        console.error('Error fetching subjects:', err);
        res.status(500).send('Error fetching subjects');
    }
};

// Handle assignment creation
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, subject } = req.body;
        if (!title || !dueDate || !subject) {
            return res.status(400).send('Missing required fields');
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
        res.status(500).send('Error creating assignment');
    }
};

// View assignments
exports.viewAssignments = async (req, res) => {
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

        res.status(403).send('Unauthorized role');
    } catch (err) {
        console.error('Error fetching assignments:', err);
        res.status(500).send('Error fetching assignments');
    }
};

// Render edit assignment page
exports.renderEditForm = async (req, res) => {
    if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');
    try {
        const assignment = await Assignment.findById(req.params.id);
        const subjects = await Subject.find({ teacher: req.session.user.id });
        if (!assignment) return res.status(404).send('Assignment not found');
        res.render('edit_assignment', { assignment, subjects });
    } catch (err) {
        console.error('Error loading edit page:', err);
        res.status(500).send('Error loading edit page');
    }
};

// Handle assignment update
exports.updateAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, subject } = req.body;
        if (!title || !dueDate || !subject) {
            return res.status(400).send('Missing required fields');
        }
        await Assignment.findByIdAndUpdate(req.params.id, {
            title,
            description,
            dueDate: new Date(dueDate),
            subject
        });
        res.redirect('/assignment/view');
    } catch (err) {
        console.error('Error updating assignment:', err);
        res.status(500).send('Error updating assignment');
    }
};

// Handle assignment deletion
exports.deleteAssignment = async (req, res) => {
    if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.redirect('/assignment/view');
    } catch (err) {
        console.error('Error deleting assignment:', err);
        res.status(500).send('Error deleting assignment');
    }
};

// Show assignment details
exports.viewAssignmentDetails = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('subject');
        if (!assignment) return res.status(404).send('Assignment not found');
        res.render('assignment_details', {
            assignment,
            userRole: req.session.user?.role,
            userId: req.session.user?.id
        });
    } catch (err) {
        console.error('Error fetching assignment details:', err);
        res.status(500).send('Internal server error');
    }
};

// View all submissions for a specific assignment
exports.viewSubmissions = async (req, res) => {
    if (req.session.user?.role !== 'teacher') return res.status(403).send('Access denied');
    try {
        const submissions = await Submission.find({ assignment: req.params.assignmentId })
            .populate('student')
            .populate('assignment');
        res.render('view_submissions', { submissions });
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).send('Error fetching submissions');
    }
};

// Render page to grade a submission
exports.renderGradeForm = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id).populate('student');
        res.render('grade_submission', { submission });
    } catch (err) {
        console.error('Error loading submission:', err);
        res.status(500).send('Failed to load submission.');
    }
};

// Submit the grade and feedback
exports.submitGrade = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        await Submission.findByIdAndUpdate(req.params.id, { grade, feedback });
        res.redirect('/assignment/view');
    } catch (err) {
        console.error('Error submitting grade:', err);
        res.status(500).send('Failed to submit grade.');
    }
};
