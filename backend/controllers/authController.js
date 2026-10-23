
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { saveOTP, verifyOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/mailer');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register and send OTP
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false,
    });

    try {
      const otp = saveOTP(normalizedEmail);
      await sendOTPEmail(normalizedEmail, otp);
    } catch (emailError) {
      // Allow the user to retry registration if sending fails.
      await User.deleteOne({ _id: user._id });

      return res.status(503).json({
        message: emailError.message || 'Could not send verification email',
      });
    }

    return res.status(201).json({
      message: 'Registration successful. Check your email for the OTP.',
      email: normalizedEmail,
      requiresOtp: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    return res.status(500).json({
      message: error.message || 'Registration failed',
    });
  }
};

// Verify OTP and issue JWT
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please register first.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is already verified. Please log in.',
      });
    }

    const result = verifyOTP(normalizedEmail, String(otp).trim());

    if (!result.valid) {
      return res.status(400).json({
        message: result.reason,
      });
    }

    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'Email verified successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'OTP verification failed',
    });
  }
};

// Resend email verification OTP
const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please register first.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is already verified. Please log in.',
      });
    }

    let otp;

    try {
      otp = saveOTP(normalizedEmail);
    } catch (error) {
      return res.status(429).json({
        message: error.message,
      });
    }

    try {
      await sendOTPEmail(normalizedEmail, otp);
    } catch (error) {
      return res.status(503).json({
        message: 'Could not send the OTP. Please try again later.',
      });
    }

    return res.status(200).json({
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to resend verification code.',
    });
  }
};


// Login — no OTP is sent during login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Never allow an unverified account to log in.
    // Registration and email verification handle OTP separately.
    if (user.isEmailVerified !== true) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        requiresOtp: true,
        email: user.email,
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Login failed',
    });
  }
};


// Get users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  verifyEmailOTP,
  resendVerificationOTP,
  loginUser,
  getUsers,
};