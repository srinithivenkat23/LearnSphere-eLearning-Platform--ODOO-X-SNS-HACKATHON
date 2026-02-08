const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Quiz = require('./models/Quiz');
const Lesson = require('./models/Lesson');
require('dotenv').config();

async function seedQuickData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find instructor (current logged in user)
        const instructor = await User.findOne({ email: 'subiksha@gmail.com' });
        if (!instructor) {
            console.log('❌ Instructor not found');
            process.exit(1);
        }
        console.log(`✅ Found instructor: ${instructor.name}`);

        // Create course
        const course = await Course.create({
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

        // Create lesson first (quiz needs lessonId)
        const lesson = await Lesson.create({
            courseId: course._id,
            title: 'React Fundamentals Assessment',
            type: 'quiz',
            contentUrl: 'temp', // Will update after quiz creation
            duration: 15,
            order: 1
        });
        console.log(`✅ Created lesson: ${lesson.title}`);

        // Create quiz
        const quiz = await Quiz.create({
            lessonId: lesson._id,
            courseId: course._id,
            title: 'React Basics Quiz',
            description: 'Test your knowledge of React fundamentals',
            questions: [
                {
                    questionText: 'What is React?',
                    options: ['A JavaScript library', 'A database', 'A CSS framework', 'A backend framework'],
                    correctAnswer: 0
                },
                {
                    questionText: 'What is JSX?',
                    options: ['A database query language', 'JavaScript XML', 'A CSS preprocessor', 'A testing framework'],
                    correctAnswer: 1
                },
                {
                    questionText: 'What hook is used for state management?',
                    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
                    correctAnswer: 1
                },
                {
                    questionText: 'What is a component in React?',
                    options: ['A database table', 'A reusable piece of UI', 'A CSS class', 'A server endpoint'],
                    correctAnswer: 1
                },
                {
                    questionText: 'What is the virtual DOM?',
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

        // Update lesson with quiz ID
        lesson.contentUrl = quiz._id.toString();
        await lesson.save();
        console.log(`✅ Updated lesson with quiz ID`);

        console.log('\n🎉 Course and Quiz created successfully!');
        console.log('\n📋 Next Steps to Test Proctoring:');
        console.log('   1. Refresh your browser');
        console.log('   2. Go to "My Courses" - you should see "React Fundamentals"');
        console.log('   3. Click on the course → Quiz tab');
        console.log('   4. You should see "React Basics Quiz"');
        console.log('\n👨‍🎓 To test as a student:');
        console.log('   1. Sign out');
        console.log('   2. Create a new student account at http://localhost:5173/signup');
        console.log('   3. Enroll in "React Fundamentals"');
        console.log('   4. Take the quiz (try switching tabs to trigger violations!)');
        console.log('   5. Sign back in as instructor to view proctoring data');

        await mongoose.connection.close();
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedQuickData();
