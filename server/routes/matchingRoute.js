const express = require('express');
const router = express.Router();
const { getMatchedStudents } = require('../controllers/matchingController');
const requireAuth = require('../middleware/requireAuth');

router.post('/', requireAuth, getMatchedStudents);

module.exports = router;
