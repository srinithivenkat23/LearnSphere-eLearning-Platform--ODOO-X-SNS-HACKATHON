const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Quiz = require('./models/Quiz');
const Lesson = require('./models/Lesson');
const Enrollment = require('./models/Enrollment');
const Attempt = require('./models/Attempt');
require('dotenv').config();

async function seedProctorData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find or create instructor
        let instructor = await User.findOne({ email: 'subiksha@gmail.com' });
        if (!instructor) {
            instructor = await User.findOne({ role: 'instructor' });
        }
        if (!instructor) {
            console.log('❌ No instructor found. Please create an instructor account first.');
            process.exit(1);
        }
        console.log(`✅ Found instructor: ${instructor.name}`);

        // Find existing students
        const students = await User.find({ role: 'student' }).limit(3);
        if (students.length === 0) {
            console.log('❌ No students found. Please create student accounts first.');
            console.log('   You can signup as a student at: http://localhost:5173/signup');
            process.exit(1);
        }
        console.log(`✅ Found ${students.length} students`);

        // Create a course
        let course = await Course.findOne({ instructorId: instructor._id });
        if (!course) {
            course = await Course.create({
                title: 'React Fundamentals',
                description: 'Learn React from scratch with hands-on projects and quizzes',
                category: 'Technology',
                level: 'Beginner',
                price: 0,
                isPaid: false,
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
                duration: '4 weeks',
                rating: 4.8,
                studentsEnrolled: 0,
                tags: ['React', 'JavaScript', 'Web Development'],
                instructorId: instructor._id,
                status: 'published'
            });
            console.log(`✅ Created course: ${course.title}`);
        } else {
            console.log(`✅ Found course: ${course.title}`);
        }

        // Create a quiz
        let quiz = await Quiz.findOne({ courseId: course._id });
        if (!quiz) {
            quiz = await Quiz.create({
                courseId: course._id,
                title: 'React Basics Quiz',
                description: 'Test your knowledge of React fundamentals',
                questions: [
                    {
                        question: 'What is React?',
                        options: ['A JavaScript library', 'A database', 'A CSS framework', 'A backend framework'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What is JSX?',
                        options: ['A database query language', 'JavaScript XML', 'A CSS preprocessor', 'A testing framework'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What hook is used for state management?',
                        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is a component in React?',
                        options: ['A database table', 'A reusable piece of UI', 'A CSS class', 'A server endpoint'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is the virtual DOM?',
                        options: ['A real DOM copy', 'A lightweight representation of the DOM', 'A database', 'A CSS framework'],
                        correctAnswer: 1
                    }
                ],
                passingScore: 60,
                rewards: {
                    attempt1: 100,
                    attempt2: 50,
                    attempt3: 25,
                    attempt4Plus: 10
                }
            });
            console.log(`✅ Created quiz: ${quiz.title}`);
        } else {
            console.log(`✅ Found quiz: ${quiz.title}`);
        }

        // Create a lesson linked to the quiz
        let lesson = await Lesson.findOne({ courseId: course._id, type: 'quiz' });
        if (!lesson) {
            lesson = await Lesson.create({
                courseId: course._id,
                title: 'React Fundamentals Assessment',
                type: 'quiz',
                contentUrl: quiz._id.toString(),
                duration: 15,
                order: 1
            });
            console.log(`✅ Created lesson: ${lesson.title}`);
        } else {
            console.log(`✅ Found lesson: ${lesson.title}`);
        }

        // Enroll students and create quiz attempts with proctoring data
        for (let i = 0; i < students.length; i++) {
            const student = students[i];

            // Create enrollment
            let enrollment = await Enrollment.findOne({ userId: student._id, courseId: course._id });
            if (!enrollment) {
                enrollment = await Enrollment.create({
                    userId: student._id,
                    courseId: course._id,
                    enrolledAt: new Date(),
                    progress: {},
                    totalPoints: 0
                });
                console.log(`✅ Enrolled ${student.name} in ${course.title}`);
            }

            // Create quiz attempts with varying proctoring violations
            const attemptData = [
                { score: 80, passed: true, tabSwitches: 0, fullScreenExits: 0 }, // Clean attempt
                { score: 60, passed: true, tabSwitches: 2, fullScreenExits: 1 }, // Some violations
                { score: 40, passed: false, tabSwitches: 5, fullScreenExits: 3 }, // Many violations
            ];

            const attempt = attemptData[i] || attemptData[0];

            const existingAttempt = await Attempt.findOne({
                userId: student._id,
                quizId: quiz._id
            });

            if (!existingAttempt) {
                await Attempt.create({
                    userId: student._id,
                    courseId: course._id,
                    quizId: quiz._id,
                    score: attempt.score,
                    total: 100,
                    passed: attempt.passed,
                    answers: {},
                    proctoring: {
                        tabSwitches: attempt.tabSwitches,
                        fullScreenExits: attempt.fullScreenExits,
                        violations: [
                            ...(attempt.tabSwitches > 0 ? [{ type: 'tab_switch', timestamp: new Date() }] : []),
                            ...(attempt.fullScreenExits > 0 ? [{ type: 'fullscreen_exit', timestamp: new Date() }] : [])
                        ],
                        webcamEnabled: false,
                        timePerQuestion: []
                    },
                    createdAt: new Date()
                });
                console.log(`✅ Created quiz attempt for ${student.name}: ${attempt.score}% (${attempt.tabSwitches} switches, ${attempt.fullScreenExits} exits)`);
            }
        }

        console.log('\n🎉 Seed data created successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Instructor: ${instructor.email}`);
        console.log(`   - Course: ${course.title}`);
        console.log(`   - Quiz: ${quiz.title}`);
        console.log(`   - Students enrolled: ${students.length}`);
        console.log(`   - Quiz attempts: ${students.length}`);
        console.log('\n🔍 To view proctoring data:');
        console.log(`   1. Login as instructor: ${instructor.email}`);
        console.log(`   2. Go to "My Courses" → "${course.title}"`);
        console.log(`   3. Click "Quiz" tab`);
        console.log(`   4. Click the graduation cap icon on "${quiz.title}"`);
        console.log(`   5. View the "Proctoring" column in the results table`);

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedProctorData();
