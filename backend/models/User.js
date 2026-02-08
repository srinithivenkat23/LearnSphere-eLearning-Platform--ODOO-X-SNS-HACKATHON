const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['learner', 'instructor', 'admin'], default: 'learner' },
    profilePhoto: { type: String }, // Filename of uploaded profile photo
    points: { type: Number, default: 0 },
    streaks: { type: Number, default: 0 },
    dailyGoal: { type: Number, default: 50 }, // points goal
    dailyProgress: { type: Number, default: 0 },
    achievements: [{
        title: String,
        icon: String,
        description: String,
        earnedAt: { type: Date, default: Date.now }
    }],
    lastActivityDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
