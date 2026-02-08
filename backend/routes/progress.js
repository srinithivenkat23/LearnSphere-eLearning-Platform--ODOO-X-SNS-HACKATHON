const express = require('express');
const router = express.Router();
const UserProgress = require('../models/UserProgress');
const Achievement = require('../models/Achievement');
const Enrollment = require('../models/Enrollment');

// Get user progress for a specific course
router.get('/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id || req.query.userId; // Fallback for demo

        let progress = await UserProgress.findOne({ userId, courseId });

        if (!progress) {
            // Create initial progress record
            progress = new UserProgress({ userId, courseId });
            await progress.save();
        }

        res.json(progress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update chapter mastery after quiz/lesson completion
router.post('/:courseId/chapter/:chapterId', async (req, res) => {
    try {
        const { courseId, chapterId } = req.params;
        const { score, timeSpent, correctAnswers, totalQuestions } = req.body;
        const userId = req.user?.id || req.body.userId;

        let progress = await UserProgress.findOne({ userId, courseId });

        if (!progress) {
            progress = new UserProgress({ userId, courseId });
        }

        // Get existing chapter data or create new
        const chapterData = progress.chapterMastery.get(chapterId) || {
            level: 0,
            lastPracticed: new Date(),
            timeSpent: 0,
            attemptsCount: 0,
            correctAnswers: 0,
            totalQuestions: 0
        };

        // Update chapter mastery
        chapterData.attemptsCount += 1;
        chapterData.correctAnswers += correctAnswers || 0;
        chapterData.totalQuestions += totalQuestions || 0;
        chapterData.timeSpent += timeSpent || 0;
        chapterData.lastPracticed = new Date();

        // Calculate mastery level (0-100)
        if (chapterData.totalQuestions > 0) {
            chapterData.level = Math.round((chapterData.correctAnswers / chapterData.totalQuestions) * 100);
        }

        progress.chapterMastery.set(chapterId, chapterData);
        progress.totalTimeSpent += timeSpent || 0;
        progress.lastActive = new Date();

        // Recalculate average score
        let totalMastery = 0;
        let chapterCount = 0;
        progress.chapterMastery.forEach((data) => {
            totalMastery += data.level;
            chapterCount++;
        });
        progress.averageScore = chapterCount > 0 ? Math.round(totalMastery / chapterCount) : 0;

        // Update strengths and weaknesses
        progress.strengths = [];
        progress.weaknesses = [];
        progress.chapterMastery.forEach((data, chapter) => {
            if (data.level >= 80) {
                progress.strengths.push(chapter);
            } else if (data.level < 50 && data.attemptsCount > 0) {
                progress.weaknesses.push(chapter);
            }
        });

        await progress.save();

        // Award XP and coins
        const achievement = await Achievement.findOne({ userId });
        if (achievement) {
            const xpGain = Math.round(score || 10);
            achievement.xp += xpGain;
            achievement.calculateLevel();
            achievement.awardCoins(Math.round(xpGain / 2), `Completed chapter: ${chapterId}`);
            await achievement.save();
        }

        res.json({ progress, message: 'Progress updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get personalized recommendations
router.get('/:courseId/recommendations', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id || req.query.userId;

        const progress = await UserProgress.findOne({ userId, courseId });

        if (!progress) {
            return res.json({ recommendations: [] });
        }

        const recommendations = [];

        // Recommend weak topics for revision
        progress.weaknesses.forEach(topic => {
            recommendations.push({
                topic,
                reason: 'weak_performance',
                priority: 5,
                message: `You scored below 50% in ${topic}. Let's practice more!`
            });
        });

        // Recommend topics not practiced recently
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        progress.chapterMastery.forEach((data, chapter) => {
            if (new Date(data.lastPracticed) < oneWeekAgo && data.level < 100) {
                recommendations.push({
                    topic: chapter,
                    reason: 'not_practiced',
                    priority: 3,
                    message: `It's been a while since you practiced ${chapter}. Quick revision?`
                });
            }
        });

        // Sort by priority (highest first)
        recommendations.sort((a, b) => b.priority - a.priority);

        res.json({ recommendations: recommendations.slice(0, 5) }); // Top 5
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get learning journey (timeline view)
router.get('/:courseId/journey', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id || req.query.userId;

        const progress = await UserProgress.findOne({ userId, courseId }).populate('courseId');
        const enrollment = await Enrollment.findOne({ userId, courseId });

        if (!progress || !enrollment) {
            return res.json({ journey: [] });
        }

        const journey = [];

        // Convert chapter mastery to timeline format
        progress.chapterMastery.forEach((data, chapterId) => {
            journey.push({
                chapterId,
                title: chapterId, // You might want to fetch actual chapter titles
                mastery: data.level,
                timeSpent: data.timeSpent,
                lastPracticed: data.lastPracticed,
                status: data.level >= 80 ? 'mastered' : data.level >= 50 ? 'in-progress' : 'needs-work'
            });
        });

        // Sort by last practiced (most recent first)
        journey.sort((a, b) => new Date(b.lastPracticed) - new Date(a.lastPracticed));

        res.json({
            journey,
            stats: {
                totalTimeSpent: progress.totalTimeSpent,
                averageScore: progress.averageScore,
                chaptersCompleted: progress.strengths.length,
                totalChapters: progress.chapterMastery.size
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
