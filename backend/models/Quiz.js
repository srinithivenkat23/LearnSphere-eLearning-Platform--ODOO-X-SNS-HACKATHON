const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true }, // Index of the correct option
        explanation: { type: String }
    }],
    passingScore: { type: Number, default: 70 },
    maxAttempts: { type: Number, default: 0 }, // 0 for unlimited
    rewards: {
        attempt1: { type: Number, default: 100 },
        attempt2: { type: Number, default: 50 },
        attempt3: { type: Number, default: 25 },
        attempt4Plus: { type: Number, default: 10 }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
