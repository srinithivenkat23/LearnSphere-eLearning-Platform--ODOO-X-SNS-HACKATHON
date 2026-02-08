const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Lesson = require('../models/Lesson');

// POST /generate - Smart AI Question Generator
router.post('/generate', async (req, res) => {
    try {
        const { lessonId } = req.body;

        // Find lesson to get context
        let contextText = "general concepts";
        let lessonTitle = "this lesson";

        if (lessonId && mongoose.Types.ObjectId.isValid(lessonId)) {
            const lesson = await Lesson.findById(lessonId);
            if (lesson) {
                contextText = lesson.description || lesson.title;
                lessonTitle = lesson.title;
            }
        }

        const keywords = contextText.split(/\s+/).filter(word => word.length > 5).slice(0, 10);
        const k1 = keywords[0] || "core concepts";
        const k2 = keywords[1] || "implementation details";
        const k3 = keywords[2] || "best practices";
        const k4 = keywords[3] || "advanced features";

        const templates = [
            {
                questionText: `Based on "${lessonTitle}", what is the primary role of ${k1}?`,
                options: [
                    `To optimize the overall performance of ${k1}`,
                    `To provide a stable foundation for ${k2}`,
                    `To handle exception cases in ${k3}`,
                    `To facilitate external integrations`
                ],
                correctAnswer: 0
            },
            {
                questionText: `Which of the following best describes the relationship between ${k2} and ${k3}?`,
                options: [
                    `${k2} is a precursor to ${k3}`,
                    `${k3} strictly depends on ${k2}'s output`,
                    `They are independent modules within ${lessonTitle}`,
                    `Both are deprecated in favor of ${k4}`
                ],
                correctAnswer: 1
            },
            {
                questionText: `In the context of this lesson, why is ${k4} considered a critical component?`,
                options: [
                    `It reduces the memory footprint of ${k1}`,
                    `It ensures data integrity across ${k2}`,
                    `It is required for compatibility with ${k3}`,
                    `It simplifies the developer experience for ${lessonTitle}`
                ],
                correctAnswer: 2
            },
            {
                questionText: `What would be the most likely outcome if ${k1} was omitted from the workflow?`,
                options: [
                    `Increased latency in ${k2}`,
                    `Failure to satisfy prerequisites for ${k4}`,
                    `No significant impact on ${lessonTitle}`,
                    `Immediate system termination`
                ],
                correctAnswer: 1
            },
            {
                questionText: `Which keyword best summarizes the focus of ${lessonTitle}?`,
                options: [
                    k1.charAt(0).toUpperCase() + k1.slice(1),
                    k2.charAt(0).toUpperCase() + k2.slice(1),
                    k3.charAt(0).toUpperCase() + k3.slice(1),
                    k4.charAt(0).toUpperCase() + k4.slice(1)
                ],
                correctAnswer: 0
            }
        ];

        // Pick 3 random templates
        const questions = templates.sort(() => 0.5 - Math.random()).slice(0, 3);

        // Simulate AI "Processing" time
        setTimeout(() => {
            res.json({ questions });
        }, 1200);

    } catch (err) {
        console.error("AI Generation Error:", err);
        res.status(500).json({ message: "AI Magic failed to spark. Please try again or create questions manually." });
    }
});

module.exports = router;
