// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  submitted: { type: Boolean, default: false },
  submissionDate: { type: Date },
});

module.exports = mongoose.model('Submission', submissionSchema);
