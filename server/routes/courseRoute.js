const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const requireAuth = require('../middleware/requireAuth');

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

router.post('/', requireAuth, courseController.createCourse);
router.delete('/:id', requireAuth, courseController.removeCourse);
router.put('/:id', requireAuth, courseController.updateCourse);
router.post('/addStudent', requireAuth, courseController.addStudentToCourse);
router.post('/removeStudent', requireAuth, courseController.removeStudentFromCourse);

module.exports = router;
