const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // Chapter-level mastery tracking
    chapterMastery: {
        type: Map,
        of: {
            level: { type: Number, default: 0, min: 0, max: 100 }, // 0-100 mastery score
            lastPracticed: { type: Date, default: Date.now },
            timeSpent: { type: Number, default: 0 }, // seconds
            attemptsCount: { type: Number, default: 0 },
            correctAnswers: { type: Number, default: 0 },
            totalQuestions: { type: Number, default: 0 }
        },
        default: {}
    },
    // Identified strengths and weaknesses
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    // AI-recommended topics for revision
    recommendedTopics: [{
        topic: String,
        reason: String, // 'weak_performance', 'not_practiced', 'upcoming_test'
        priority: { type: Number, default: 1 } // 1-5
    }],
    // Overall course analytics
    totalTimeSpent: { type: Number, default: 0 }, // seconds
    lastActive: { type: Date, default: Date.now },
    averageScore: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Index for quick lookups
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
