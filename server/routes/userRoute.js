const express = require('express');
const {
  signupUser,
  loginUser,
  getAllUsers,
  getUserById,
  removeUser,
  updateUser,
} = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

router.get('/', requireAuth, getAllUsers);
router.get('/:id', requireAuth, getUserById);
router.delete('/:id', requireAuth, removeUser);
router.patch('/:id', requireAuth, updateUser);

module.exports = router;
