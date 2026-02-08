const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');

// POST a review
router.post('/:courseId', async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Mock user for now
        const user = await User.findOne({ role: 'learner' });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newReview = {
            userId: user._id,
            userName: user.name,
            rating: Number(rating),
            comment
        };

        course.reviews.push(newReview);

        // Update average rating
        const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
        course.rating = totalRating / course.reviews.length;
        course.reviewsCount = course.reviews.length;

        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
