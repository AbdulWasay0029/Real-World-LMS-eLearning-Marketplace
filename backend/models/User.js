const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    // NEW: Progress Tracking
    // Stores which lessons are completed for each course e.g. [{ course: "123", completedLessons: ["lessonId1", "lessonId2"] }]
    courseProgress: [{
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        completedLessons: [{ type: String }] // Storing Lesson IDs (Mongoose subdoc IDs)
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
