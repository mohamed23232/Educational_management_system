// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  submitted: { type: Boolean, default: false },
  submissionDate: { type: Date, default: null },
  grade: { type: String, default: null },
  feedback: { type: String, default: null },
  content: { type: String,required: true},
});

module.exports = mongoose.model('Submission', submissionSchema);
