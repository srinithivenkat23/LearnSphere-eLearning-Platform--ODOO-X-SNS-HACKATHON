const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// POST /add - Directly add a learner to a course
router.post('/add', async (req, res) => {
    try {
        const { courseId, email, name } = req.body;

        // 1. Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                role: 'learner',
                password: 'password123', // Default password
                points: 0
            });
        }

        // 2. Check for existing enrollment
        const existing = await Enrollment.findOne({ userId: user._id, courseId });
        if (existing) {
            return res.status(400).json({ message: 'User is already enrolled in this course' });
        }

        // 3. Create enrollment
        const enrollment = await Enrollment.create({
            userId: user._id,
            courseId,
            progressPercent: 0,
            completed: false,
            enrolledAt: new Date()
        });

        // Mock email sending
        console.log(`[MOCK EMAIL] Sent course invitation to ${email} for course ${courseId}`);

        res.status(201).json({ success: true, user, enrollment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /contact - Contact attendees
router.post('/contact', async (req, res) => {
    try {
        const { courseId, subject, message } = req.body;

        // In a real app, find all enrolled students and send emails
        const enrollments = await Enrollment.find({ courseId }).populate('userId');
        const studentEmails = enrollments.map(e => e.userId?.email).filter(Boolean);

        console.log(`[MOCK EMAIL] Sending broadcast to ${studentEmails.length} students of course ${courseId}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);

        res.json({ success: true, count: studentEmails.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
