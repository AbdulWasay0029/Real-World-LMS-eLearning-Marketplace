const mongoose = require('mongoose');
const User = require('./backend/models/User'); // Adjust path as needed
const Course = require('./backend/models/Course');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const viewUsers = async () => {
    await connectDB();
    const users = await User.find({});
    console.log('--- USERS ---');
    users.forEach(u => {
        console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });
    console.log('-------------');
    process.exit();
};

viewUsers();
