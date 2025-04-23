// models/Subject.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});

module.exports = mongoose.model('Subject', subjectSchema);
