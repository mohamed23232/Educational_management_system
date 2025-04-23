// models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject'},
});

module.exports = mongoose.model('Assignment', assignmentSchema);
