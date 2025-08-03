const Customer = require('../models/Customer');
const Labor = require('../models/Labor');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;

// Configure NodeMailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const loginUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let user;

    if (role === 'Customer') {
      user = await Customer.findOne({ username });
    } else if (role === 'Labor') {
      user = await Labor.findOne({ username });
    } else if (role === 'Admin') {
      user = await Admin.findOne({ username });
    } else {
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // === 2-STEP VERIFICATION for Customers only ===
    if (role === 'Customer') {
      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      user.verificationCode = code;
      user.codeExpiresAt = expiry;
      await user.save();

      // Send email
      await transporter.sendMail({
        from: `"LaborLink Verification" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your Verification Code',
        html: `<p>Your verification code is: <b>${code}</b></p><p>This code will expire in 10 minutes.</p>`,
      });

      return res.status(200).json({
        message: 'Verification code sent to your email',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
    }

    // For Labor and Admin (no 2-step verification)
    const payload = {
      id: user._id,
      username: user.username,
      role: role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: `${role} login successful`,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  loginUser
};
