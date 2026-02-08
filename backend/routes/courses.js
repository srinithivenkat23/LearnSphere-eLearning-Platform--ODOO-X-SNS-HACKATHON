const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET all published courses (or all for a specific instructor)
router.get('/', async (req, res) => {
    try {
        const { search, category, instructorId, all } = req.query;
        let query = {};

        if (all !== 'true') {
            query.published = true;
        }

        if (instructorId) {
            query.instructorId = instructorId;
            delete query.published; // Instructor can see their drafts
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        const courses = await Course.find(query);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE course
router.post('/', async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE course
router.put('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE course
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
