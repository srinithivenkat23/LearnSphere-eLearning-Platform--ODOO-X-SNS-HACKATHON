const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    answers: { type: mongoose.Schema.Types.Mixed },
    proctoring: {
        tabSwitches: { type: Number, default: 0 },
        fullScreenExits: { type: Number, default: 0 },
        violations: [{
            type: { type: String },
            timestamp: { type: Date }
        }],
        webcamEnabled: { type: Boolean, default: false },
        timePerQuestion: [{ type: Number }]
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attempt', attemptSchema);
