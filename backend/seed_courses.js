const mongoose = require('mongoose');
const Course = require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

const INSTRUCTOR_ID = '69725613c8d338520929148d'; // abdulwasay4678@gmail.com

const courses = [
    {
        title: "Complete React Zero to Hero",
        description: "Master React.js from scratch. Learn Hooks, Context API, Redux, and Next.js in this comprehensive guide.",
        price: 49.99,
        category: "Development",
        instructor: INSTRUCTOR_ID,
        status: "published",
        lessons: [
            { title: "Introduction to React", content: "React is a library...", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
            { title: "Components & Props", content: "Props allow you to pass data...", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" }
        ],
        rating: 4.8
    },
    {
        title: "UI/UX Design Masterclass",
        description: "Learn to design beautiful interfaces using Figma. Understand color theory, typography, and layout.",
        price: 89.99,
        category: "Design",
        instructor: INSTRUCTOR_ID,
        status: "published",
        lessons: [
            { title: "Getting Started with Figma", content: "Figma is a cloud-based tool...", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" }
        ],
        rating: 4.5
    },
    {
        title: "Business Strategy for Startups",
        description: "How to validate your idea, find product-market fit, and scale your business.",
        price: 29.99,
        category: "Business",
        instructor: INSTRUCTOR_ID,
        status: "published",
        lessons: [
            { title: "The Lean Startup", content: "Build, Measure, Learn...", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" }
        ],
        rating: 4.2
    },
    {
        title: "Hidden Draft Course (For Testing)",
        description: "This course should only be visible in your dashboard, not the marketplace.",
        price: 999.00,
        category: "Development",
        instructor: INSTRUCTOR_ID,
        status: "draft",
        lessons: [
            { title: "Secret Lesson", content: "Shhh...", videoUrl: "" }
        ],
        rating: 0
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Mongo. Seeding courses...');

        // Optional: Clear existing courses for this instructor to avoid duplicates?
        // Nah, let's just append. User asked to "create seed data".

        await Course.insertMany(courses);
        console.log('Courses seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seed();
