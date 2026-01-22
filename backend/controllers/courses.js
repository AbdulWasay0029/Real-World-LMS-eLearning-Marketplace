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

        let isAuthorized = false;
        let isOwner = false;
        const user = req.user;

        // NEW: Inject progress if user is loaded
        let userProgress = [];

        if (user) {
            if (course.instructor._id.toString() === user._id.toString()) {
                isAuthorized = true;
                isOwner = true;
            } else if (user.purchasedCourses.includes(course._id)) {
                isAuthorized = true;
                // Find progress
                const progressRecord = user.courseProgress.find(p => p.course.toString() === course._id.toString());
                if (progressRecord) {
                    userProgress = progressRecord.completedLessons;
                }
            } else if (user.role === 'admin') {
                isAuthorized = true;
                isOwner = true;
            }
        }

        if (course.status === 'draft' && !isOwner) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (isAuthorized) {
            res.json({ ...course.toObject(), userProgress });
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
        // Populate purchased courses
        // We also need to Calculate Process % for each course manually here
        const user = await User.findById(req.user._id).populate({
            path: 'purchasedCourses',
            populate: { path: 'instructor', select: 'name' }
        });

        // Map courses to add 'progress' field
        const enrollments = user.purchasedCourses.map(course => {
            const progressRecord = user.courseProgress.find(p => p.course.toString() === course._id.toString());
            const completedCount = progressRecord ? progressRecord.completedLessons.length : 0;
            const totalLessons = course.lessons.length;
            const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            return {
                ...course.toObject(),
                progressPercentage,
                completedLessons: progressRecord ? progressRecord.completedLessons : []
            };
        });

        res.json(enrollments);
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
        // Initialize empty progress
        user.courseProgress.push({ course: courseId, completedLessons: [] });

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

// NEW: Toggle Lesson Completion
exports.toggleLessonComplete = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.purchasedCourses.includes(courseId)) {
            return res.status(403).json({ error: 'Not enrolled in this course' });
        }

        // Find the progress record
        let progressIndex = user.courseProgress.findIndex(p => p.course.toString() === courseId);

        if (progressIndex === -1) {
            // Should not happen if enrolled correctly, but handle migration case
            user.courseProgress.push({ course: courseId, completedLessons: [] });
            progressIndex = user.courseProgress.length - 1;
        }

        const completedLessons = user.courseProgress[progressIndex].completedLessons;
        const isCompleted = completedLessons.includes(lessonId);

        if (isCompleted) {
            // Remove it (Undo complete)
            user.courseProgress[progressIndex].completedLessons = completedLessons.filter(id => id !== lessonId);
        } else {
            // Add it
            user.courseProgress[progressIndex].completedLessons.push(lessonId);
        }

        await user.save();
        res.json({
            completedLessons: user.courseProgress[progressIndex].completedLessons,
            isCompleted: !isCompleted
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// NEW: Add Course Review
exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Check if user is enrolled
        const user = await User.findById(req.user._id);
        if (!user.purchasedCourses.includes(req.params.id)) {
            return res.status(403).json({ error: 'Must be enrolled to leave a review' });
        }

        // Check if already reviewed
        const alreadyReviewed = course.reviews.find(r => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) {
            return res.status(400).json({ error: 'You have already reviewed this course' });
        }

        course.reviews.push({
            user: req.user._id,
            rating,
            comment
        });

        // Recalculate Average Rating
        const total = course.reviews.reduce((acc, item) => item.rating + acc, 0);
        course.rating = total / course.reviews.length;

        await course.save();
        res.status(201).json({ message: 'Review added' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
