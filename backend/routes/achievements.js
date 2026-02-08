const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');

// Get user achievements
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        let achievement = await Achievement.findOne({ userId });

        if (!achievement) {
            // Create initial achievement record
            achievement = new Achievement({ userId });
            await achievement.save();
        }

        res.json(achievement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update daily streak
router.post('/:userId/streak', async (req, res) => {
    try {
        const { userId } = req.params;

        let achievement = await Achievement.findOne({ userId });

        if (!achievement) {
            achievement = new Achievement({ userId });
        }

        const newStreak = achievement.updateStreak();

        // Award streak bonus
        if (newStreak % 7 === 0) {
            // Weekly streak bonus
            achievement.awardCoins(50, `${newStreak}-day streak bonus!`);
            achievement.xp += 100;
        } else if (newStreak > 1) {
            achievement.awardCoins(5, 'Daily login');
            achievement.xp += 10;
        }

        achievement.calculateLevel();
        await achievement.save();

        res.json({
            streak: newStreak,
            message: newStreak > 1 ? `${newStreak} day streak! 🔥` : 'Welcome back!',
            achievement
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Award badge
router.post('/:userId/badge', async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, description, icon, category } = req.body;

        let achievement = await Achievement.findOne({ userId });

        if (!achievement) {
            achievement = new Achievement({ userId });
        }

        // Check if badge already exists
        const existingBadge = achievement.badges.find(b => b.name === name);
        if (existingBadge) {
            return res.status(400).json({ message: 'Badge already earned' });
        }

        achievement.badges.push({ name, description, icon, category });
        achievement.awardCoins(20, `Earned badge: ${name}`);
        achievement.xp += 50;
        achievement.calculateLevel();

        await achievement.save();

        res.json({
            message: `Badge earned: ${name}!`,
            badge: achievement.badges[achievement.badges.length - 1],
            achievement
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Award coins
router.post('/:userId/coins', async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, reason } = req.body;

        let achievement = await Achievement.findOne({ userId });

        if (!achievement) {
            achievement = new Achievement({ userId });
        }

        achievement.awardCoins(amount, reason);
        await achievement.save();

        res.json({
            coins: achievement.coins,
            message: `+${amount} coins!`,
            achievement
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get leaderboard (top achievers)
router.get('/leaderboard/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topAchievers = await Achievement.find()
            .sort({ xp: -1 })
            .limit(limit)
            .populate('userId', 'name email');

        res.json(topAchievers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
