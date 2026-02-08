const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Badge system
    badges: [{
        name: String,
        description: String,
        icon: String,
        category: String, // 'milestone', 'streak', 'performance', 'social'
        earnedAt: { type: Date, default: Date.now }
    }],
    // Streak tracking
    streaks: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastActiveDate: { type: Date }
    },
    // Virtual currency
    coins: { type: Number, default: 0 },
    coinsHistory: [{
        amount: Number,
        reason: String,
        timestamp: { type: Date, default: Date.now }
    }],
    // Level system
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    // Challenge stats
    challengesCompleted: { type: Number, default: 0 },
    challengesWon: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Calculate level from XP
achievementSchema.methods.calculateLevel = function () {
    // Simple formula: level = floor(sqrt(xp / 100))
    this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
    return this.level;
};

// Award coins
achievementSchema.methods.awardCoins = function (amount, reason) {
    this.coins += amount;
    this.coinsHistory.push({ amount, reason });
    return this.coins;
};

// Update streak
achievementSchema.methods.updateStreak = function () {
    const today = new Date().toDateString();
    const lastActive = this.streaks.lastActiveDate ? new Date(this.streaks.lastActiveDate).toDateString() : null;

    if (lastActive === today) {
        // Already logged in today
        return this.streaks.current;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastActive === yesterdayStr) {
        // Continuing streak
        this.streaks.current += 1;
        if (this.streaks.current > this.streaks.longest) {
            this.streaks.longest = this.streaks.current;
        }
    } else {
        // Streak broken
        this.streaks.current = 1;
    }

    this.streaks.lastActiveDate = new Date();
    return this.streaks.current;
};

module.exports = mongoose.model('Achievement', achievementSchema);
