const express = require('express');
const router = express.Router();
const Attempt = require('../models/Attempt');
const Course = require('../models/Course');

// GET all attempts for a course (Instructor/Admin)
router.get('/course/:courseId', async (req, res) => {
    try {
        const attempts = await Attempt.find({ courseId: req.params.courseId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all attempts for an instructor's courses
router.get('/instructor/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const courses = await Course.find({ instructorId });
        const courseIds = courses.map(c => c._id);

        const attempts = await Attempt.find({ courseId: { $in: courseIds } })
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all attempts for a quiz (Instructor/Admin)
router.get('/quiz/:quizId', async (req, res) => {
    try {
        const attempts = await Attempt.find({ quizId: req.params.quizId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all attempts (Admin)
router.get('/all', async (req, res) => {
    try {
        const attempts = await Attempt.find()
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST save attempt
router.post('/', async (req, res) => {
    try {
        const attempt = await Attempt.create(req.body);
        res.status(201).json(attempt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
