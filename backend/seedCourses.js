const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

// Sample courses data with free and paid options
const sampleCourses = [
    // Technology - Free Courses
    {
        title: "Introduction to Web Development",
        description: "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites from scratch.",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        duration: "6 weeks",
        rating: 4.7,
        studentsEnrolled: 15234,
        tags: ["HTML", "CSS", "JavaScript", "Web Development"]
    },
    {
        title: "Python Programming Basics",
        description: "Master Python fundamentals including variables, loops, functions, and object-oriented programming.",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
        duration: "8 weeks",
        rating: 4.8,
        studentsEnrolled: 23456,
        tags: ["Python", "Programming", "Coding"]
    },
    {
        title: "Git & GitHub Essentials",
        description: "Learn version control with Git and collaborate on projects using GitHub.",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800",
        duration: "3 weeks",
        rating: 4.6,
        studentsEnrolled: 8765,
        tags: ["Git", "GitHub", "Version Control"]
    },

    // Technology - Paid Courses
    {
        title: "Full Stack Web Development Bootcamp",
        description: "Comprehensive course covering React, Node.js, MongoDB, and deployment. Build 10+ real-world projects.",
        category: "Technology",
        level: "Intermediate",
        price: 4999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
        duration: "16 weeks",
        rating: 4.9,
        studentsEnrolled: 5432,
        tags: ["React", "Node.js", "MongoDB", "Full Stack"]
    },
    {
        title: "Advanced Machine Learning & AI",
        description: "Deep dive into neural networks, deep learning, and AI applications using TensorFlow and PyTorch.",
        category: "Technology",
        level: "Advanced",
        price: 7999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800",
        duration: "20 weeks",
        rating: 4.8,
        studentsEnrolled: 3210,
        tags: ["Machine Learning", "AI", "Deep Learning", "TensorFlow"]
    },
    {
        title: "Mobile App Development with React Native",
        description: "Build cross-platform mobile apps for iOS and Android using React Native and Expo.",
        category: "Technology",
        level: "Intermediate",
        price: 5499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
        duration: "12 weeks",
        rating: 4.7,
        studentsEnrolled: 4567,
        tags: ["React Native", "Mobile Development", "iOS", "Android"]
    },

    // Business - Free Courses
    {
        title: "Digital Marketing Fundamentals",
        description: "Learn SEO, social media marketing, email campaigns, and analytics to grow your business online.",
        category: "Business",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        duration: "5 weeks",
        rating: 4.5,
        studentsEnrolled: 12345,
        tags: ["Marketing", "SEO", "Social Media"]
    },
    {
        title: "Introduction to Entrepreneurship",
        description: "Discover how to start and grow your own business with practical strategies and case studies.",
        category: "Business",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        duration: "4 weeks",
        rating: 4.6,
        studentsEnrolled: 9876,
        tags: ["Entrepreneurship", "Startup", "Business"]
    },

    // Business - Paid Courses
    {
        title: "MBA Essentials: Strategy & Leadership",
        description: "Master business strategy, leadership skills, and management principles taught by industry experts.",
        category: "Business",
        level: "Advanced",
        price: 8999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
        duration: "24 weeks",
        rating: 4.9,
        studentsEnrolled: 2345,
        tags: ["MBA", "Leadership", "Strategy", "Management"]
    },
    {
        title: "Financial Analysis & Investment",
        description: "Learn financial modeling, valuation techniques, and investment strategies for smart decision-making.",
        category: "Business",
        level: "Intermediate",
        price: 6499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
        duration: "10 weeks",
        rating: 4.7,
        studentsEnrolled: 3456,
        tags: ["Finance", "Investment", "Analysis"]
    },

    // Design - Free Courses
    {
        title: "UI/UX Design Principles",
        description: "Learn the fundamentals of user interface and user experience design with hands-on projects.",
        category: "Design",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
        duration: "6 weeks",
        rating: 4.8,
        studentsEnrolled: 11234,
        tags: ["UI", "UX", "Design", "Figma"]
    },
    {
        title: "Graphic Design Basics",
        description: "Master Adobe Photoshop and Illustrator to create stunning graphics and visual content.",
        category: "Design",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
        duration: "5 weeks",
        rating: 4.6,
        studentsEnrolled: 8901,
        tags: ["Graphic Design", "Photoshop", "Illustrator"]
    },

    // Design - Paid Courses
    {
        title: "Advanced UX Research & Strategy",
        description: "Conduct user research, create personas, and design data-driven user experiences.",
        category: "Design",
        level: "Advanced",
        price: 5999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800",
        duration: "14 weeks",
        rating: 4.9,
        studentsEnrolled: 2789,
        tags: ["UX Research", "User Testing", "Strategy"]
    },
    {
        title: "Motion Graphics & Animation",
        description: "Create professional animations and motion graphics using After Effects and Cinema 4D.",
        category: "Design",
        level: "Intermediate",
        price: 4999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
        duration: "12 weeks",
        rating: 4.7,
        studentsEnrolled: 3567,
        tags: ["Animation", "Motion Graphics", "After Effects"]
    },

    // Data Science - Free Courses
    {
        title: "Data Analysis with Excel",
        description: "Learn data cleaning, pivot tables, charts, and basic statistical analysis using Microsoft Excel.",
        category: "Data Science",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        duration: "4 weeks",
        rating: 4.5,
        studentsEnrolled: 14567,
        tags: ["Excel", "Data Analysis", "Statistics"]
    },

    // Data Science - Paid Courses
    {
        title: "Data Science Professional Certificate",
        description: "Complete data science program covering Python, SQL, machine learning, and data visualization.",
        category: "Data Science",
        level: "Intermediate",
        price: 9999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800",
        duration: "28 weeks",
        rating: 4.9,
        studentsEnrolled: 4321,
        tags: ["Data Science", "Python", "Machine Learning", "SQL"]
    },
    {
        title: "Big Data & Cloud Computing",
        description: "Master Hadoop, Spark, AWS, and Azure for processing and analyzing massive datasets.",
        category: "Data Science",
        level: "Advanced",
        price: 8499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        duration: "18 weeks",
        rating: 4.8,
        studentsEnrolled: 2890,
        tags: ["Big Data", "Cloud", "AWS", "Spark"]
    },

    // Personal Development - Free Courses
    {
        title: "Time Management Mastery",
        description: "Boost productivity and achieve your goals with proven time management techniques.",
        category: "Personal Development",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        duration: "3 weeks",
        rating: 4.7,
        studentsEnrolled: 16789,
        tags: ["Productivity", "Time Management", "Goals"]
    },

    // Personal Development - Paid Courses
    {
        title: "Public Speaking & Communication",
        description: "Overcome fear and become a confident, persuasive speaker in any situation.",
        category: "Personal Development",
        level: "Intermediate",
        price: 3999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
        duration: "8 weeks",
        rating: 4.8,
        studentsEnrolled: 5678,
        tags: ["Public Speaking", "Communication", "Confidence"]
    }
];

async function seedCourses() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find an instructor user to assign courses to
        let instructor = await User.findOne({ role: 'instructor' });

        if (!instructor) {
            console.log('No instructor found. Creating default instructor...');
            instructor = await User.create({
                name: 'Dr. Sarah Johnson',
                email: 'instructor@learnsphere.com',
                password: 'password123', // In production, this should be hashed
                role: 'instructor'
            });
        }

        // Clear existing courses (optional - comment out if you want to keep existing courses)
        // await Course.deleteMany({});
        // console.log('Cleared existing courses');

        // Add instructor ID to all courses
        const coursesWithInstructor = sampleCourses.map(course => ({
            ...course,
            instructorId: instructor._id
        }));

        // Insert courses
        const insertedCourses = await Course.insertMany(coursesWithInstructor);
        console.log(`✅ Successfully added ${insertedCourses.length} courses!`);

        // Summary
        const freeCount = insertedCourses.filter(c => !c.isPaid).length;
        const paidCount = insertedCourses.filter(c => c.isPaid).length;
        console.log(`   - Free courses: ${freeCount}`);
        console.log(`   - Paid courses: ${paidCount}`);

        // Categories breakdown
        const categories = {};
        insertedCourses.forEach(course => {
            categories[course.category] = (categories[course.category] || 0) + 1;
        });
        console.log('\nCourses by category:');
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`   - ${cat}: ${count} courses`);
        });

        mongoose.connection.close();
        console.log('\n✨ Database seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedCourses();
