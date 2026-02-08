const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// GET all enrollments for a user (Mocked with seeded learner)
router.get('/my-courses', async (req, res) => {
    try {
        const user = await User.findOne({ role: 'learner' });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const enrollments = await Enrollment.find({ userId: user._id }).populate('courseId');
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST enroll in a course (The "Join" or "Buy" move)
router.post('/enroll', async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = await User.findOne({ role: 'learner' }); // Mocked current user

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if already enrolled
        const existing = await Enrollment.findOne({ userId: user._id, courseId });
        if (existing) return res.status(400).json({ message: 'Already enrolled' });

        const enrollment = await Enrollment.create({
            userId: user._id,
            courseId: courseId,
            progressPercent: 0,
            lastActive: new Date()
        });

        // Award 10 points for joining a new course
        user.points += 10;
        await user.save();

        res.status(201).json({ enrollment, userPoints: user.points });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update progress (The "Start" or "Continue" move)
router.put('/:id/progress', async (req, res) => {
    try {
        const { progress, progressPercent, lessonId, attempts, completed, pointsReward } = req.body;
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        // Update progress map and percentage
        if (progress) {
            enrollment.progress = progress;
        } else if (lessonId) {
            // Update individual lesson progress without overwriting others
            const currentProgress = enrollment.progress ? Object.fromEntries(enrollment.progress) : {};
            currentProgress[lessonId] = {
                ...(currentProgress[lessonId] || {}),
                attempts: attempts !== undefined ? attempts : (currentProgress[lessonId]?.attempts || 0),
                completed: completed !== undefined ? completed : (currentProgress[lessonId]?.completed || false),
                completedAt: completed ? new Date() : currentProgress[lessonId]?.completedAt
            };
            enrollment.progress = currentProgress;
        }

        if (progressPercent !== undefined) enrollment.progressPercent = progressPercent;

        // Points handling
        const user = await User.findById(enrollment.userId);
        if (user) {
            if (pointsReward) {
                user.points += pointsReward;
            } else {
                user.points += 5; // Default "move" points
            }
            await user.save();
        }

        enrollment.lastActive = new Date();
        if (enrollment.progressPercent >= 100) enrollment.completed = true;

        await enrollment.save();
        res.json({ enrollment, userPoints: user ? user.points : 0 });
    } catch (err) {
        console.error("Progress error:", err);
        res.status(500).json({ message: err.message });
    }
});

// GET all enrollments for an instructor's courses
router.get('/instructor/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const courses = await Course.find({ instructorId });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .populate('courseId')
            .populate('userId', 'name email');
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all enrollments (Admin only - though we just check role for now)
router.get('/all', async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('courseId')
            .populate('userId', 'name email');
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
