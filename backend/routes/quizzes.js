const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// GET quiz by lesson ID
router.get('/lesson/:lessonId', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all quizzes for a course
router.get('/course/:courseId', async (req, res) => {
    try {
        const quizzes = await Quiz.find({ courseId: req.params.courseId });
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE quiz
router.post('/', async (req, res) => {
    try {
        let quizData = req.body;

        // If no lessonId provided, create a lesson first
        if (!quizData.lessonId) {
            const Lesson = require('../models/Lesson');
            const lesson = await Lesson.create({
                courseId: quizData.courseId,
                title: quizData.title || 'Quiz Lesson',
                type: 'quiz',
                contentUrl: 'temp', // Will be updated with quiz ID
                duration: 15,
                order: 999 // Place at end, instructor can reorder
            });
            quizData.lessonId = lesson._id;
        }

        const quiz = await Quiz.create(quizData);

        // Update lesson's contentUrl with quiz ID
        if (quiz.lessonId) {
            const Lesson = require('../models/Lesson');
            await Lesson.findByIdAndUpdate(quiz.lessonId, {
                contentUrl: quiz._id.toString()
            });
        }

        res.status(201).json(quiz);
    } catch (err) {
        console.error('Quiz creation error:', err);
        res.status(500).json({ message: err.message });
    }
});

// UPDATE quiz
router.put('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE quiz
router.delete('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json({ message: 'Quiz deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
