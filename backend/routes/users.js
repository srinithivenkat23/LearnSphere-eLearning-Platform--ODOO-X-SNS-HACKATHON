const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// MOCK Login/Signup for Learner Portal
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            name,
            email,
            password, // In a real app, hash this!
            role: role || 'learner',
            points: 0
        });

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Simulating password check (matching seed.js logic)
        if (password !== 'password123' && user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET user profile
router.get('/profile', async (req, res) => {
    try {
        // Mocked: return the first learner for now to keep things moving
        const user = await User.findOne({ role: 'learner' });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio } = req.body;
        const user = await User.findByIdAndUpdate(id, { name, bio }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Instructor/Admin stats
router.get('/stats/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { role } = req.query;
        const Course = require('../models/Course');

        let studentsCount = 0;
        let coursesCount = 0;
        let completions = 0;
        let totalHours = 0;

        if (role === 'admin') {
            studentsCount = await User.countDocuments({ role: 'learner' });
            coursesCount = await Course.countDocuments();
            completions = await Enrollment.countDocuments({ progressPercent: 100 });

            const courses = await Course.find();
            totalHours = courses.reduce((acc, c) => acc + (parseInt(c.totalDuration) || 0), 0);
        } else {
            const instructorCourses = await Course.find({ instructorId });
            coursesCount = instructorCourses.length;
            const courseIds = instructorCourses.map(c => c._id);

            // Count unique students enrolled in these courses
            const uniqueStudents = await Enrollment.distinct('userId', { courseId: { $in: courseIds } });
            studentsCount = uniqueStudents.length;

            // Count completions
            completions = await Enrollment.countDocuments({
                courseId: { $in: courseIds },
                progressPercent: 100
            });

            totalHours = instructorCourses.reduce((acc, c) => acc + (parseInt(c.totalDuration) || 0), 0);
        }

        res.json({
            students: studentsCount,
            courses: coursesCount,
            completions,
            hours: totalHours || coursesCount * 12 // Fallback
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Recent Activity (Enrollments + Reviews)
router.get('/activity/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { role } = req.query;
        const Course = require('../models/Course');

        let courseIds = [];
        if (role === 'admin') {
            const courses = await Course.find({}, '_id');
            courseIds = courses.map(c => c._id);
        } else {
            const courses = await Course.find({ instructorId }, '_id');
            courseIds = courses.map(c => c._id);
        }

        // Fetch recent enrollments
        const recentEnrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .sort({ enrolledAt: -1 })
            .limit(10)
            .populate('userId', 'name')
            .populate('courseId', 'title');

        const enrollmentActivities = recentEnrollments.map(e => ({
            id: e._id,
            type: 'enrollment',
            message: `New student ${e.userId?.name || 'Learner'} enrolled in "${e.courseId?.title || 'Course'}"`,
            date: e.enrolledAt,
            timeAgo: getTimeAgo(e.enrolledAt)
        }));

        // Fetch recent reviews from course models
        const instructorCourses = await Course.find({ _id: { $in: courseIds } });
        let reviewActivities = [];
        instructorCourses.forEach(course => {
            (course.reviews || []).forEach(rev => {
                reviewActivities.push({
                    id: rev._id,
                    type: 'review',
                    message: `${rev.userName || 'Learner'} left a ${rev.rating}-star review on "${course.title}"`,
                    date: rev.createdAt,
                    timeAgo: getTimeAgo(rev.createdAt)
                });
            });
        });

        // Merge and sort
        const activity = [...enrollmentActivities, ...reviewActivities]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        res.json(activity);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Helper for time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

// GET all instructors and admins (for Responsible Admin selection)
router.get('/backoffice-users', async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['instructor', 'admin'] } }, 'name email role');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /leaderboard - Get top learners by points
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'learner' })
            .sort({ points: -1 })
            .limit(10)
            .select('name email points');
        res.json(topUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
