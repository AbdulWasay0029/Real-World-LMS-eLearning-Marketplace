const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load env relative to this script location (in backend root)
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- USERS ---');
        const users = await User.find({});
        users.forEach(u => {
            console.log(`ID: ${u._id} | Email: ${u.email} | Role: ${u.role}`);
        });
        console.log('-------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
