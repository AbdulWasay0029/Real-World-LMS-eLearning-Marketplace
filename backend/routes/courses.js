const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createCourse, getCourses, updateCourse, deleteCourse } = require('../controllers/courses');

router.post('/', auth, createCourse);
router.get('/', getCourses);
router.put('/:id', auth, updateCourse);
router.delete('/:id', auth, deleteCourse);

module.exports = router;
