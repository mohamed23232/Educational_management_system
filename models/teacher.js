// models/Teacher.js
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Teacher', teacherSchema);
