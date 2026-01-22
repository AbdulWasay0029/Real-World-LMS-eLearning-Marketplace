const Course = require('../models/Course');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.createCourse = [
    upload.single('video'),
    async (req, res) => {
        try {
            const { title, description, price, category, lessons, status } = req.body;
            let parsedLessons = [];
            try {
                parsedLessons = JSON.parse(lessons);
            } catch (e) {
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
                lessons: parsedLessons,
                status: status || 'draft'
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
        const courses = await Course.find({ status: 'published' }).select('-lessons').populate('instructor', 'name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name');
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // AUTH CHECK logic simplified by optionalAuth
        let isAuthorized = false;
        let isOwner = false;
        const user = req.user; // Populated by optionalAuth if token exists

        if (user) {
            if (course.instructor._id.toString() === user._id.toString()) {
                isAuthorized = true;
                isOwner = true;
            } else if (user.purchasedCourses.includes(course._id)) {
                isAuthorized = true;
            } else if (user.role === 'admin') {
                isAuthorized = true;
                isOwner = true;
            }
        }

        if (course.status === 'draft' && !isOwner) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (isAuthorized) {
            res.json(course);
        } else {
            const publicCourse = {
                _id: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                category: course.category,
                instructor: course.instructor,
                rating: course.rating,
                status: course.status,
                lessons: course.lessons.map(l => ({ title: l.title, content: "", videoUrl: "" }))
            };
            res.json(publicCourse);
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getMyEnrollments = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'purchasedCourses',
            populate: { path: 'instructor', select: 'name' }
        });
        res.json(user.purchasedCourses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyCreatedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id });
        const coursesWithStats = await Promise.all(courses.map(async (course) => {
            const studentCount = await User.countDocuments({ purchasedCourses: course._id });
            return {
                ...course.toObject(),
                studentCount
            };
        }));
        res.json(coursesWithStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.enrollCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user._id;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can enroll in courses.' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        if (course.status === 'draft') {
            return res.status(403).json({ error: 'Cannot enroll in draft courses.' });
        }
        if (course.instructor.toString() === userId.toString()) {
            return res.status(400).json({ error: 'Instructors cannot enroll in their own courses.' });
        }

        const user = await User.findById(userId);
        if (user.purchasedCourses.includes(courseId)) {
            return res.status(400).json({ error: 'You are already enrolled in this course.' });
        }

        user.purchasedCourses.push(courseId);
        await user.save();

        res.status(200).json({ message: 'Enrolled successfully', courseId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this course' });
        }

        const studentCount = await User.countDocuments({ purchasedCourses: course._id });
        if (studentCount > 0) {
            if (req.body.lessons && req.body.lessons.length < course.lessons.length) {
                return res.status(400).json({ error: 'Cannot remove lessons from a course with active students.' });
            }
        }

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this course' });
        }

        const studentCount = await User.countDocuments({ purchasedCourses: course._id });
        if (studentCount > 0) {
            return res.status(400).json({ error: 'Cannot delete a course with enrolled students. Archive it instead.' });
        }

        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
