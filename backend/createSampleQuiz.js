const mongoose = require('mongoose');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
require('dotenv').config();

async function createSampleQuiz() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find the specific course
        const course = await Course.findOne({ title: "Introduction to Web Development" });
        if (!course) {
            console.error('❌ Course "Introduction to Web Development" not found!');
            process.exit(1);
        }
        console.log(`found course: ${course.title}`);

        // 2. Create a Lesson for the Quiz
        const quizLesson = await Lesson.create({
            courseId: course._id,
            title: "Final Exam (Proctored)",
            description: "This is a proctored exam. Full-screen mode is required.",
            type: "quiz",
            order: 99, // Put it at the end
            isPublished: true,
            duration: "30 mins"
        });
        console.log(`✅ Created Quiz Lesson: ${quizLesson.title}`);

        // 3. Create the actual Quiz content
        const quiz = await Quiz.create({
            lessonId: quizLesson._id,
            courseId: course._id,
            title: "Web Development Final Exam",
            description: "Test your knowledge of HTML, CSS, and JS. Warning: Proctoring is enabled.",
            proctoringEnabled: true, // <--- ENABLING PROCTORING
            passingScore: 70,
            questions: [
                {
                    questionText: "Which HTML tag is used to define an internal style sheet?",
                    options: ["<css>", "<script>", "<style>", "<link>"],
                    correctAnswer: 2
                },
                {
                    questionText: "Which property is used to change the background color?",
                    options: ["color", "bgcolor", "background-color", "bg-color"],
                    correctAnswer: 2
                },
                {
                    questionText: "How do you write 'Hello World' in an alert box in JavaScript?",
                    options: ["msg('Hello World');", "alert('Hello World');", "msgBox('Hello World');", "console.log('Hello World');"],
                    correctAnswer: 1
                },
                {
                    questionText: "Which is strict equality operator in JavaScript?",
                    options: ["=", "==", "===", "!=="],
                    correctAnswer: 2
                }
            ]
        });
        console.log(`✅ Created Proctored Quiz: ${quiz.title}`);

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createSampleQuiz();
