const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    progressPercent: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    completedAt: { type: Date },
    lastActive: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 }, // In minutes
    progress: { type: Map, of: Object, default: {} } // Stores lesson completion status
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
