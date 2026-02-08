const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        await Enrollment.deleteMany({});
        await Lesson.deleteMany({});
        await Quiz.deleteMany({});

        // Create a dummy learner
        const learner = await User.create({
            name: 'Test Learner',
            email: 'learner@example.com',
            password: 'password123',
            role: 'learner',
            points: 75
        });

        // Create courses
        const reactCourse = await Course.create({
            title: 'Complete React Guide',
            description: 'Learn React from scratch to advanced concepts. This course covers everything from JSX to advanced Hooks and performance optimization.',
            shortDescription: 'Modern React with Hooks and Redux.',
            imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            tags: ['React', 'JavaScript', 'Web Development'],
            category: 'Development',
            published: true,
            accessRule: 'open',
            rating: 4.8,
            reviewsCount: 1,
            studentsCount: 1500,
            lessonsCount: 3,
            reviews: [
                { userName: 'Alice Wang', rating: 5, comment: 'Amazing course! Very clear instructions.' }
            ]
        });

        const uiuxCourse = await Course.create({
            title: 'Mastering UI/UX Design',
            description: 'Design beautiful interfaces and provide great user experiences.',
            shortDescription: 'Figma to high-fidelity prototypes.',
            imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            tags: ['Design', 'UI/UX', 'Figma'],
            category: 'Design',
            instructorName: 'Jane Smith',
            published: true,
            accessRule: 'open',
            rating: 4.9,
            reviewsCount: 85,
            studentsCount: 950,
            lessonsCount: 2
        });

        const nodeCourse = await Course.create({
            title: 'Backend with Node.js',
            description: 'Build scalable APIs using Express and MongoDB.',
            shortDescription: 'Node.js, Express, MongoDB, and JWT.',
            imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            tags: ['Node.js', 'Express', 'MongoDB'],
            category: 'Development',
            instructorName: 'Bob Wilson',
            published: true,
            accessRule: 'payment',
            price: 29.99,
            rating: 4.7,
            reviewsCount: 45,
            studentsCount: 500,
            lessonsCount: 1
        });

        // Create lessons
        const reactLessons = await Lesson.create([
            {
                courseId: reactCourse._id,
                title: 'Introduction to React',
                description: 'What is React and why use it? In this lesson, we explore the history and core philosophy of React.',
                type: 'video',
                contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: '10:00',
                order: 1,
                attachments: [{ name: 'React Introduction PDF', url: '#', type: 'file' }]
            },
            {
                courseId: reactCourse._id,
                title: 'JSX and Components',
                description: 'Deep dive into JSX syntax and building your first functional component.',
                type: 'video',
                contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                duration: '15:20',
                order: 2,
                attachments: [{ name: 'JSX Cheatsheet', url: '#', type: 'file' }]
            },
            {
                courseId: reactCourse._id,
                title: 'React Fundamentals Quiz',
                description: 'Test your knowledge on the basics of React.',
                type: 'quiz',
                duration: '5:00',
                order: 3
            }
        ]);

        const quizLesson = reactLessons[2];

        // Create a quiz for the quiz lesson
        await Quiz.create({
            lessonId: quizLesson._id,
            courseId: reactCourse._id,
            title: 'React Basics Quiz',
            description: 'This quiz tests your knowledge on the core concepts of React, JSX, and Components.',
            passingScore: 60,
            questions: [
                {
                    questionText: 'What is React?',
                    options: ['A backend framework', 'A frontend library', 'A database', 'An operating system'],
                    correctAnswer: 1,
                    explanation: 'React is a JavaScript library for building user interfaces.'
                },
                {
                    questionText: 'What is JSX?',
                    options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XSLT', 'Just Some X-ray'],
                    correctAnswer: 0,
                    explanation: 'JSX stands for JavaScript XML, allowing you to write HTML-like code in JavaScript.'
                }
            ],
            rewards: { points: 25 }
        });

        await Lesson.create([
            {
                courseId: uiuxCourse._id,
                title: 'Design Principles',
                description: 'Color theory, typography, and spacing.',
                type: 'document',
                contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                duration: '20:00',
                order: 1
            }
        ]);

        // Create an enrollment
        await Enrollment.create({
            userId: learner._id,
            courseId: reactCourse._id,
            progressPercent: 35,
            completed: false,
            progress: {
                'lesson1': { completed: true },
                'lesson2': { completed: true }
            }
        });

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedData();
