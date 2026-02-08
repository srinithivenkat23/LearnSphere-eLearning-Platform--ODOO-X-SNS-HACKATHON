const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

// 60 Sample courses - 30 FREE and 30 PAID
const sampleCourses = [
    // ==================== FREE COURSES (30) ====================

    // Technology - Free (10 courses)
    {
        title: "Introduction to Web Development",
        description: "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites from scratch. Perfect for absolute beginners.",
        shortDescription: "Master web basics with HTML, CSS & JavaScript",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        duration: "6 weeks",
        rating: 4.7,
        studentsEnrolled: 15234,
        tags: ["HTML", "CSS", "JavaScript", "Web Development"],
        published: true
    },
    {
        title: "Python Programming Basics",
        description: "Master Python fundamentals including variables, loops, functions, and object-oriented programming. Build real projects.",
        shortDescription: "Learn Python from zero to hero",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
        duration: "8 weeks",
        rating: 4.8,
        studentsEnrolled: 23456,
        tags: ["Python", "Programming", "Coding"],
        published: true
    },
    {
        title: "Git & GitHub Essentials",
        description: "Learn version control with Git and collaborate on projects using GitHub. Essential for all developers.",
        shortDescription: "Master version control with Git",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800",
        duration: "3 weeks",
        rating: 4.6,
        studentsEnrolled: 8765,
        tags: ["Git", "GitHub", "Version Control"],
        published: true
    },
    {
        title: "SQL Database Fundamentals",
        description: "Learn database design, SQL queries, joins, and data manipulation. Work with MySQL and PostgreSQL.",
        shortDescription: "Database essentials for beginners",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800",
        duration: "5 weeks",
        rating: 4.5,
        studentsEnrolled: 11234,
        tags: ["SQL", "Database", "MySQL"],
        published: true
    },
    {
        title: "Linux Command Line Basics",
        description: "Master the terminal, shell scripting, and Linux system administration fundamentals.",
        shortDescription: "Command line mastery for developers",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800",
        duration: "4 weeks",
        rating: 4.7,
        studentsEnrolled: 9876,
        tags: ["Linux", "Command Line", "Shell"],
        published: true
    },
    {
        title: "Introduction to APIs & REST",
        description: "Understand RESTful APIs, HTTP methods, and how to consume APIs in your applications.",
        shortDescription: "Learn API fundamentals",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
        duration: "4 weeks",
        rating: 4.6,
        studentsEnrolled: 7654,
        tags: ["API", "REST", "HTTP"],
        published: true
    },
    {
        title: "Responsive Web Design",
        description: "Create beautiful, mobile-friendly websites using CSS Grid, Flexbox, and media queries.",
        shortDescription: "Build mobile-first websites",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
        duration: "5 weeks",
        rating: 4.8,
        studentsEnrolled: 13456,
        tags: ["CSS", "Responsive Design", "Mobile"],
        published: true
    },
    {
        title: "JavaScript ES6+ Features",
        description: "Master modern JavaScript including arrow functions, promises, async/await, and destructuring.",
        shortDescription: "Modern JavaScript essentials",
        category: "Technology",
        level: "Intermediate",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800",
        duration: "6 weeks",
        rating: 4.7,
        studentsEnrolled: 10234,
        tags: ["JavaScript", "ES6", "Modern JS"],
        published: true
    },
    {
        title: "Introduction to Cybersecurity",
        description: "Learn security fundamentals, common vulnerabilities, and how to protect systems and data.",
        shortDescription: "Security basics for everyone",
        category: "Technology",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
        duration: "6 weeks",
        rating: 4.6,
        studentsEnrolled: 8901,
        tags: ["Security", "Cybersecurity", "Hacking"],
        published: true
    },
    {
        title: "Docker Basics for Developers",
        description: "Learn containerization with Docker, create images, and deploy applications efficiently.",
        shortDescription: "Containerization made simple",
        category: "Technology",
        level: "Intermediate",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800",
        duration: "4 weeks",
        rating: 4.7,
        studentsEnrolled: 6789,
        tags: ["Docker", "DevOps", "Containers"],
        published: true
    },

    // Business - Free (7 courses)
    {
        title: "Digital Marketing Fundamentals",
        description: "Learn SEO, social media marketing, email campaigns, and analytics to grow your business online.",
        shortDescription: "Master digital marketing basics",
        category: "Business",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        duration: "5 weeks",
        rating: 4.5,
        studentsEnrolled: 12345,
        tags: ["Marketing", "SEO", "Social Media"],
        published: true
    },
    {
        title: "Introduction to Entrepreneurship",
        description: "Discover how to start and grow your own business with practical strategies and case studies.",
        shortDescription: "Start your business journey",
        category: "Business",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        duration: "4 weeks",
        rating: 4.6,
        studentsEnrolled: 9876,
        tags: ["Entrepreneurship", "Startup", "Business"],
        published: true
    },
    {
        title: "Business Communication Skills",
        description: "Improve your professional communication, email writing, and presentation skills.",
        shortDescription: "Communicate like a pro",
        category: "Business",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
        duration: "3 weeks",
        rating: 4.5,
        studentsEnrolled: 11567,
        tags: ["Communication", "Business Writing"],
        published: true
    },
    {
        title: "Project Management Basics",
        description: "Learn project planning, execution, and team management fundamentals.",
        shortDescription: "Manage projects effectively",
        category: "Business",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        duration: "5 weeks",
        rating: 4.6,
        studentsEnrolled: 8234,
        tags: ["Project Management", "Planning"],
        published: true
    },
    {
        title: "Customer Service Excellence",
        description: "Master customer service skills, conflict resolution, and building customer loyalty.",
        shortDescription: "Deliver exceptional service",
        category: "Business",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
        duration: "4 weeks",
        rating: 4.7,
        studentsEnrolled: 9345,
        tags: ["Customer Service", "Communication"],
        published: true
    },
    {
        title: "Introduction to E-commerce",
        description: "Learn how to start and run an online store, from product selection to marketing.",
        shortDescription: "Build your online store",
        category: "Business",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800",
        duration: "6 weeks",
        rating: 4.5,
        studentsEnrolled: 7890,
        tags: ["E-commerce", "Online Business"],
        published: true
    },
    {
        title: "Business Analytics Fundamentals",
        description: "Learn to analyze business data, create reports, and make data-driven decisions.",
        shortDescription: "Data-driven decision making",
        category: "Business",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        duration: "5 weeks",
        rating: 4.6,
        studentsEnrolled: 6789,
        tags: ["Analytics", "Business Intelligence"],
        published: true
    },

    // Design - Free (6 courses)
    {
        title: "UI/UX Design Principles",
        description: "Learn the fundamentals of user interface and user experience design with hands-on projects.",
        shortDescription: "Design beautiful user experiences",
        category: "Design",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
        duration: "6 weeks",
        rating: 4.8,
        studentsEnrolled: 11234,
        tags: ["UI", "UX", "Design", "Figma"],
        published: true
    },
    {
        title: "Graphic Design Basics",
        description: "Master Adobe Photoshop and Illustrator to create stunning graphics and visual content.",
        shortDescription: "Create stunning graphics",
        category: "Design",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
        duration: "5 weeks",
        rating: 4.6,
        studentsEnrolled: 8901,
        tags: ["Graphic Design", "Photoshop", "Illustrator"],
        published: true
    },
    {
        title: "Color Theory for Designers",
        description: "Understand color psychology, harmony, and how to create effective color palettes.",
        shortDescription: "Master the art of color",
        category: "Design",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800",
        duration: "3 weeks",
        rating: 4.7,
        studentsEnrolled: 9456,
        tags: ["Color Theory", "Design"],
        published: true
    },
    {
        title: "Typography Fundamentals",
        description: "Learn font selection, pairing, and typography principles for effective design.",
        shortDescription: "Typography essentials",
        category: "Design",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800",
        duration: "4 weeks",
        rating: 4.6,
        studentsEnrolled: 7234,
        tags: ["Typography", "Fonts", "Design"],
        published: true
    },
    {
        title: "Figma for Beginners",
        description: "Master Figma for UI design, prototyping, and collaboration with design teams.",
        shortDescription: "Design with Figma",
        category: "Design",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800",
        duration: "5 weeks",
        rating: 4.8,
        studentsEnrolled: 10567,
        tags: ["Figma", "UI Design", "Prototyping"],
        published: true
    },
    {
        title: "Logo Design Essentials",
        description: "Create memorable logos and brand identities using design principles and tools.",
        shortDescription: "Design impactful logos",
        category: "Design",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800",
        duration: "4 weeks",
        rating: 4.5,
        studentsEnrolled: 6890,
        tags: ["Logo Design", "Branding"],
        published: true
    },

    // Data Science - Free (4 courses)
    {
        title: "Data Analysis with Excel",
        description: "Learn data cleaning, pivot tables, charts, and basic statistical analysis using Microsoft Excel.",
        shortDescription: "Excel for data analysis",
        category: "Data Science",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        duration: "4 weeks",
        rating: 4.5,
        studentsEnrolled: 14567,
        tags: ["Excel", "Data Analysis", "Statistics"],
        published: true
    },
    {
        title: "Introduction to Statistics",
        description: "Learn statistical concepts, probability, and data interpretation for data science.",
        shortDescription: "Statistics fundamentals",
        category: "Data Science",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800",
        duration: "6 weeks",
        rating: 4.6,
        studentsEnrolled: 8901,
        tags: ["Statistics", "Math", "Data"],
        published: true
    },
    {
        title: "Data Visualization Basics",
        description: "Create compelling charts and visualizations to tell stories with data.",
        shortDescription: "Visualize data effectively",
        category: "Data Science",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        duration: "4 weeks",
        rating: 4.7,
        studentsEnrolled: 7654,
        tags: ["Data Visualization", "Charts"],
        published: true
    },
    {
        title: "Python for Data Analysis",
        description: "Use Python, Pandas, and NumPy for data manipulation and analysis.",
        shortDescription: "Analyze data with Python",
        category: "Data Science",
        level: "Intermediate",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        duration: "8 weeks",
        rating: 4.8,
        studentsEnrolled: 9234,
        tags: ["Python", "Pandas", "Data Analysis"],
        published: true
    },

    // Personal Development - Free (3 courses)
    {
        title: "Time Management Mastery",
        description: "Boost productivity and achieve your goals with proven time management techniques.",
        shortDescription: "Master your time",
        category: "Personal Development",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        duration: "3 weeks",
        rating: 4.7,
        studentsEnrolled: 16789,
        tags: ["Productivity", "Time Management", "Goals"],
        published: true
    },
    {
        title: "Mindfulness & Stress Management",
        description: "Learn meditation, breathing techniques, and strategies to reduce stress and anxiety.",
        shortDescription: "Find your inner peace",
        category: "Personal Development",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        duration: "4 weeks",
        rating: 4.8,
        studentsEnrolled: 12456,
        tags: ["Mindfulness", "Meditation", "Wellness"],
        published: true
    },
    {
        title: "Goal Setting & Achievement",
        description: "Set SMART goals, create action plans, and develop habits for success.",
        shortDescription: "Achieve your dreams",
        category: "Personal Development",
        level: "Beginner",
        price: 0,
        isPaid: false,
        thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        duration: "3 weeks",
        rating: 4.6,
        studentsEnrolled: 10234,
        tags: ["Goals", "Success", "Habits"],
        published: true
    },

    // ==================== PAID COURSES (30) ====================

    // Technology - Paid (10 courses)
    {
        title: "Full Stack Web Development Bootcamp",
        description: "Comprehensive course covering React, Node.js, MongoDB, and deployment. Build 10+ real-world projects and become job-ready.",
        shortDescription: "Become a full-stack developer",
        category: "Technology",
        level: "Intermediate",
        price: 4999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
        duration: "16 weeks",
        rating: 4.9,
        studentsEnrolled: 5432,
        tags: ["React", "Node.js", "MongoDB", "Full Stack"],
        published: true
    },
    {
        title: "Advanced Machine Learning & AI",
        description: "Deep dive into neural networks, deep learning, and AI applications using TensorFlow and PyTorch. Industry-level projects included.",
        shortDescription: "Master AI and deep learning",
        category: "Technology",
        level: "Advanced",
        price: 7999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800",
        duration: "20 weeks",
        rating: 4.8,
        studentsEnrolled: 3210,
        tags: ["Machine Learning", "AI", "Deep Learning", "TensorFlow"],
        published: true
    },
    {
        title: "Mobile App Development with React Native",
        description: "Build cross-platform mobile apps for iOS and Android using React Native and Expo. Publish to app stores.",
        shortDescription: "Build mobile apps",
        category: "Technology",
        level: "Intermediate",
        price: 5499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
        duration: "12 weeks",
        rating: 4.7,
        studentsEnrolled: 4567,
        tags: ["React Native", "Mobile Development", "iOS", "Android"],
        published: true
    },
    {
        title: "AWS Cloud Architect Certification",
        description: "Master AWS services, cloud architecture, and prepare for AWS Solutions Architect certification.",
        shortDescription: "Become AWS certified",
        category: "Technology",
        level: "Advanced",
        price: 6999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        duration: "14 weeks",
        rating: 4.8,
        studentsEnrolled: 3890,
        tags: ["AWS", "Cloud", "DevOps", "Certification"],
        published: true
    },
    {
        title: "Blockchain & Cryptocurrency Development",
        description: "Build decentralized applications, smart contracts, and understand blockchain technology deeply.",
        shortDescription: "Master blockchain development",
        category: "Technology",
        level: "Advanced",
        price: 8999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
        duration: "18 weeks",
        rating: 4.7,
        studentsEnrolled: 2456,
        tags: ["Blockchain", "Cryptocurrency", "Smart Contracts"],
        published: true
    },
    {
        title: "Cybersecurity Professional Bootcamp",
        description: "Ethical hacking, penetration testing, and security operations. Prepare for CEH certification.",
        shortDescription: "Become a security expert",
        category: "Technology",
        level: "Advanced",
        price: 7499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
        duration: "16 weeks",
        rating: 4.9,
        studentsEnrolled: 3567,
        tags: ["Cybersecurity", "Ethical Hacking", "Security"],
        published: true
    },
    {
        title: "iOS Development with Swift",
        description: "Build native iOS apps with Swift and SwiftUI. Publish to the App Store.",
        shortDescription: "Create iOS apps",
        category: "Technology",
        level: "Intermediate",
        price: 5999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
        duration: "14 weeks",
        rating: 4.7,
        studentsEnrolled: 2890,
        tags: ["iOS", "Swift", "SwiftUI", "Mobile"],
        published: true
    },
    {
        title: "DevOps Engineering Masterclass",
        description: "Master CI/CD, Kubernetes, Docker, Jenkins, and cloud infrastructure automation.",
        shortDescription: "Become a DevOps engineer",
        category: "Technology",
        level: "Advanced",
        price: 6499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800",
        duration: "15 weeks",
        rating: 4.8,
        studentsEnrolled: 3234,
        tags: ["DevOps", "Kubernetes", "CI/CD", "Docker"],
        published: true
    },
    {
        title: "Game Development with Unity",
        description: "Create 2D and 3D games using Unity and C#. Build a portfolio of playable games.",
        shortDescription: "Build amazing games",
        category: "Technology",
        level: "Intermediate",
        price: 5499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
        duration: "16 weeks",
        rating: 4.7,
        studentsEnrolled: 4123,
        tags: ["Unity", "Game Development", "C#"],
        published: true
    },
    {
        title: "Advanced Python Programming",
        description: "Master advanced Python concepts, design patterns, testing, and performance optimization.",
        shortDescription: "Python mastery course",
        category: "Technology",
        level: "Advanced",
        price: 4499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
        duration: "12 weeks",
        rating: 4.8,
        studentsEnrolled: 3678,
        tags: ["Python", "Advanced Programming"],
        published: true
    },

    // Business - Paid (7 courses)
    {
        title: "MBA Essentials: Strategy & Leadership",
        description: "Master business strategy, leadership skills, and management principles taught by industry experts and Harvard professors.",
        shortDescription: "MBA-level business education",
        category: "Business",
        level: "Advanced",
        price: 8999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
        duration: "24 weeks",
        rating: 4.9,
        studentsEnrolled: 2345,
        tags: ["MBA", "Leadership", "Strategy", "Management"],
        published: true
    },
    {
        title: "Financial Analysis & Investment",
        description: "Learn financial modeling, valuation techniques, and investment strategies for smart decision-making.",
        shortDescription: "Master financial analysis",
        category: "Business",
        level: "Intermediate",
        price: 6499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
        duration: "10 weeks",
        rating: 4.7,
        studentsEnrolled: 3456,
        tags: ["Finance", "Investment", "Analysis"],
        published: true
    },
    {
        title: "Digital Marketing Mastery",
        description: "Advanced SEO, PPC, social media advertising, and conversion optimization strategies.",
        shortDescription: "Advanced marketing strategies",
        category: "Business",
        level: "Advanced",
        price: 5999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        duration: "12 weeks",
        rating: 4.8,
        studentsEnrolled: 4234,
        tags: ["Marketing", "SEO", "PPC", "Social Media"],
        published: true
    },
    {
        title: "Product Management Professional",
        description: "Learn product strategy, roadmapping, user research, and agile methodologies.",
        shortDescription: "Become a product manager",
        category: "Business",
        level: "Intermediate",
        price: 7499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        duration: "14 weeks",
        rating: 4.8,
        studentsEnrolled: 2890,
        tags: ["Product Management", "Agile", "Strategy"],
        published: true
    },
    {
        title: "Sales & Negotiation Mastery",
        description: "Master sales techniques, negotiation strategies, and closing deals effectively.",
        shortDescription: "Close more deals",
        category: "Business",
        level: "Intermediate",
        price: 4999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800",
        duration: "8 weeks",
        rating: 4.7,
        studentsEnrolled: 3567,
        tags: ["Sales", "Negotiation", "Business"],
        published: true
    },
    {
        title: "Supply Chain Management",
        description: "Optimize logistics, inventory, and supply chain operations for business efficiency.",
        shortDescription: "Master supply chain",
        category: "Business",
        level: "Advanced",
        price: 6999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
        duration: "12 weeks",
        rating: 4.6,
        studentsEnrolled: 2123,
        tags: ["Supply Chain", "Logistics", "Operations"],
        published: true
    },
    {
        title: "Human Resources Management",
        description: "Talent acquisition, employee engagement, performance management, and HR analytics.",
        shortDescription: "HR professional certification",
        category: "Business",
        level: "Intermediate",
        price: 5499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        duration: "10 weeks",
        rating: 4.7,
        studentsEnrolled: 2678,
        tags: ["HR", "Human Resources", "Management"],
        published: true
    },

    // Design - Paid (6 courses)
    {
        title: "Advanced UX Research & Strategy",
        description: "Conduct user research, create personas, and design data-driven user experiences with industry tools.",
        shortDescription: "UX research mastery",
        category: "Design",
        level: "Advanced",
        price: 5999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800",
        duration: "14 weeks",
        rating: 4.9,
        studentsEnrolled: 2789,
        tags: ["UX Research", "User Testing", "Strategy"],
        published: true
    },
    {
        title: "Motion Graphics & Animation",
        description: "Create professional animations and motion graphics using After Effects and Cinema 4D.",
        shortDescription: "Animate like a pro",
        category: "Design",
        level: "Intermediate",
        price: 4999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
        duration: "12 weeks",
        rating: 4.7,
        studentsEnrolled: 3567,
        tags: ["Animation", "Motion Graphics", "After Effects"],
        published: true
    },
    {
        title: "Brand Identity Design Masterclass",
        description: "Create complete brand identities, style guides, and visual systems for businesses.",
        shortDescription: "Build powerful brands",
        category: "Design",
        level: "Advanced",
        price: 6499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800",
        duration: "10 weeks",
        rating: 4.8,
        studentsEnrolled: 2345,
        tags: ["Branding", "Identity Design", "Logo"],
        published: true
    },
    {
        title: "3D Design & Modeling",
        description: "Master Blender and 3D modeling for games, animation, and product visualization.",
        shortDescription: "Create stunning 3D art",
        category: "Design",
        level: "Intermediate",
        price: 5499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        duration: "16 weeks",
        rating: 4.7,
        studentsEnrolled: 2890,
        tags: ["3D", "Blender", "Modeling"],
        published: true
    },
    {
        title: "UI Design System Creation",
        description: "Build scalable design systems, component libraries, and design tokens for products.",
        shortDescription: "Design system expert",
        category: "Design",
        level: "Advanced",
        price: 6999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
        duration: "12 weeks",
        rating: 4.9,
        studentsEnrolled: 2123,
        tags: ["Design Systems", "UI", "Components"],
        published: true
    },
    {
        title: "Video Editing & Production",
        description: "Master Adobe Premiere Pro, DaVinci Resolve, and professional video production techniques.",
        shortDescription: "Professional video editing",
        category: "Design",
        level: "Intermediate",
        price: 4499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
        duration: "10 weeks",
        rating: 4.6,
        studentsEnrolled: 3234,
        tags: ["Video Editing", "Premiere Pro", "Production"],
        published: true
    },

    // Data Science - Paid (4 courses)
    {
        title: "Data Science Professional Certificate",
        description: "Complete data science program covering Python, SQL, machine learning, and data visualization. Industry-recognized certificate.",
        shortDescription: "Complete data science path",
        category: "Data Science",
        level: "Intermediate",
        price: 9999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800",
        duration: "28 weeks",
        rating: 4.9,
        studentsEnrolled: 4321,
        tags: ["Data Science", "Python", "Machine Learning", "SQL"],
        published: true
    },
    {
        title: "Big Data & Cloud Computing",
        description: "Master Hadoop, Spark, AWS, and Azure for processing and analyzing massive datasets.",
        shortDescription: "Big data mastery",
        category: "Data Science",
        level: "Advanced",
        price: 8499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        duration: "18 weeks",
        rating: 4.8,
        studentsEnrolled: 2890,
        tags: ["Big Data", "Cloud", "AWS", "Spark"],
        published: true
    },
    {
        title: "Deep Learning Specialization",
        description: "Neural networks, CNNs, RNNs, and transformers. Build AI models from scratch.",
        shortDescription: "Deep learning expert",
        category: "Data Science",
        level: "Advanced",
        price: 7999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800",
        duration: "20 weeks",
        rating: 4.9,
        studentsEnrolled: 3456,
        tags: ["Deep Learning", "Neural Networks", "AI"],
        published: true
    },
    {
        title: "Business Intelligence & Tableau",
        description: "Create interactive dashboards, reports, and data visualizations with Tableau and Power BI.",
        shortDescription: "BI and visualization",
        category: "Data Science",
        level: "Intermediate",
        price: 5499,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        duration: "10 weeks",
        rating: 4.7,
        studentsEnrolled: 3789,
        tags: ["Tableau", "Power BI", "Business Intelligence"],
        published: true
    },

    // Personal Development - Paid (3 courses)
    {
        title: "Public Speaking & Communication",
        description: "Overcome fear and become a confident, persuasive speaker in any situation. TED-style presentation training.",
        shortDescription: "Speak with confidence",
        category: "Personal Development",
        level: "Intermediate",
        price: 3999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
        duration: "8 weeks",
        rating: 4.8,
        studentsEnrolled: 5678,
        tags: ["Public Speaking", "Communication", "Confidence"],
        published: true
    },
    {
        title: "Leadership & Executive Coaching",
        description: "Develop leadership skills, emotional intelligence, and executive presence for career advancement.",
        shortDescription: "Lead with impact",
        category: "Personal Development",
        level: "Advanced",
        price: 7999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
        duration: "12 weeks",
        rating: 4.9,
        studentsEnrolled: 2345,
        tags: ["Leadership", "Executive Coaching", "Management"],
        published: true
    },
    {
        title: "Career Transformation Bootcamp",
        description: "Resume building, interview mastery, salary negotiation, and career strategy for landing your dream job.",
        shortDescription: "Transform your career",
        category: "Personal Development",
        level: "Intermediate",
        price: 4999,
        isPaid: true,
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        duration: "6 weeks",
        rating: 4.7,
        studentsEnrolled: 4567,
        tags: ["Career", "Job Search", "Interview"],
        published: true
    }
];

async function seedCourses() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

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
            console.log('✅ Created default instructor');
        }

        // Clear existing courses (optional - uncomment if you want fresh data)
        await Course.deleteMany({});
        console.log('🗑️  Cleared existing courses');

        // Add instructor ID and instructor name to all courses
        const coursesWithInstructor = sampleCourses.map(course => ({
            ...course,
            instructorId: instructor._id,
            instructorName: instructor.name,
            instructorEmail: instructor.email,
            accessRule: course.isPaid ? 'payment' : 'open',
            published: true
        }));

        // Insert courses
        const insertedCourses = await Course.insertMany(coursesWithInstructor);
        console.log(`\n✅ Successfully added ${insertedCourses.length} courses!`);

        // Create Lessons for each course
        const Lesson = require('./models/Lesson');
        await Lesson.deleteMany({}); // Clear existing lessons
        console.log('🗑️  Cleared existing lessons');

        const allLessons = [];

        for (const course of insertedCourses) {
            // Create 3-5 lessons per course
            const lessonCount = Math.floor(Math.random() * 3) + 3;

            for (let i = 1; i <= lessonCount; i++) {
                allLessons.push({
                    courseId: course._id,
                    title: `Lesson ${i}: Introduction to ${course.title}`,
                    description: `This is lesson ${i} of the course. You will learn key concepts and practical applications.`,
                    contentUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Sample video
                    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                    thumbnailUrl: course.thumbnail,
                    duration: "10:00",
                    videoDuration: 600,
                    type: "video",
                    order: i,
                    isPublished: true,
                    isFree: i === 1 // First lesson free
                });
            }
        }

        const insertedLessons = await Lesson.insertMany(allLessons);
        console.log(`✅ Successfully added ${insertedLessons.length} lessons!`);


        // Summary
        const freeCount = insertedCourses.filter(c => !c.isPaid).length;
        const paidCount = insertedCourses.filter(c => c.isPaid).length;
        console.log(`\n📊 Course Summary:`);
        console.log(`   💚 Free courses: ${freeCount}`);
        console.log(`   💰 Paid courses: ${paidCount}`);

        // Categories breakdown
        const categories = {};
        insertedCourses.forEach(course => {
            if (!categories[course.category]) {
                categories[course.category] = { free: 0, paid: 0, total: 0 };
            }
            categories[course.category].total++;
            if (course.isPaid) {
                categories[course.category].paid++;
            } else {
                categories[course.category].free++;
            }
        });

        console.log('\n📚 Courses by Category:');
        Object.entries(categories).forEach(([cat, counts]) => {
            console.log(`   ${cat}: ${counts.total} total (${counts.free} free, ${counts.paid} paid)`);
        });

        // Price range for paid courses
        const paidCourses = insertedCourses.filter(c => c.isPaid);
        const prices = paidCourses.map(c => c.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

        console.log('\n💵 Paid Course Pricing:');
        console.log(`   Min: ₹${minPrice}`);
        console.log(`   Max: ₹${maxPrice}`);
        console.log(`   Avg: ₹${avgPrice}`);

        mongoose.connection.close();
        console.log('\n✨ Database seeding complete!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedCourses();
