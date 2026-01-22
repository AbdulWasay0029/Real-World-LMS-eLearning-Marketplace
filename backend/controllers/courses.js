const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.createCourse = [
    upload.single('video'),
    async (req, res) => {
        try {
            const { title, description, price, category, lessons } = req.body;
            let parsedLessons = [];
            try {
                parsedLessons = JSON.parse(lessons);
            } catch (e) {
                // If lessons is just a string or object not JSON stringified
                parsedLessons = lessons;
            }

            let videoUrl = '';
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'video' });
                videoUrl = result.secure_url;
            }

            const course = new Course({
                title,
                description,
                price,
                category,
                instructor: req.user._id,
                lessons: parsedLessons
            });

            if (videoUrl && course.lessons.length > 0) {
                course.lessons[0].videoUrl = videoUrl;
            }

            await course.save();
            res.status(201).json(course);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor', 'name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
