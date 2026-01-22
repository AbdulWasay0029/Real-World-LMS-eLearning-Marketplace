const express = require('express');
const router = express.Router();
// Import auth middleware explicitly to check object vs function
const authMiddleware = require('../middleware/auth');
// Handle both CommonJS export styles (module.exports = fn vs module.exports = { auth, optionalAuth })
const auth = authMiddleware.auth || authMiddleware;
const optionalAuth = authMiddleware.optionalAuth;

const { createCourse, getCourses, getCourseById, enrollCourse, getMyEnrollments, getMyCreatedCourses, updateCourse, deleteCourse } = require('../controllers/courses');

router.post('/', auth, createCourse);
router.get('/', getCourses);

router.get('/my/enrollments', auth, getMyEnrollments);
router.get('/my/created', auth, getMyCreatedCourses);

// Apply optionalAuth to getCourseById to populate req.user if token is present
router.get('/:id', optionalAuth, getCourseById);

router.post('/:id/enroll', auth, enrollCourse);
router.put('/:id', auth, updateCourse);
router.delete('/:id', auth, deleteCourse);

module.exports = router;
