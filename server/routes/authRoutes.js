const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { signup, login, googleLogin, getMe, completeProfile, updateProfile } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.patch('/complete-profile', protect, upload.single('photo'), completeProfile);
router.patch('/profile', protect, upload.single('photo'), updateProfile);

module.exports = router;