const express = require('express');
const router = express.Router();

const {
    registerUser,
    verifyEmailOTP,
    resendVerificationOTP,
    loginUser,
    getUsers,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/register', registerUser);
router.post('/verify-email', verifyEmailOTP);
router.post('/login', loginUser);
router.post('/resend-otp', resendVerificationOTP);
router.get('/', protect, admin, getUsers);

module.exports = router;
