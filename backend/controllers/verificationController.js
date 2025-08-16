const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // If you send emails here
const JWT_SECRET = process.env.JWT_SECRET;

// Existing verification method
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (!customer.verificationCode || !customer.codeExpiresAt) {
      return res.status(400).json({ error: 'No verification code found. Please login again.' });
    }

    if (customer.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (customer.codeExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Verification code expired. Please login again.' });
    }

    // Clear the verification code from DB
    customer.verificationCode = undefined;
    customer.codeExpiresAt = undefined;
    await customer.save();

    // Issue final JWT token
    const token = jwt.sign(
      { id: customer._id, username: customer.username, role: 'Customer' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Verification successful. Logged in.',
      token,
      user: {
        id: customer._id,
        username: customer.username,
        email: customer.email,
        role: 'Customer'
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ New method: Enable/Disable 2-Step Verification
const toggleTwoStepVerification = async (req, res) => {
  try {
    const { customerId, enable } = req.body; // enable = true or false

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    customer.twoStepEnabled = enable;

    // Only generate & send code if enabling 2-step
    if (enable) {
      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      customer.verificationCode = code;
      customer.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

      // Send email (example)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customer.email,
        subject: 'Your 2-Step Verification Code',
        text: `Your verification code is: ${code}`
      });
    } else {
      // If disabling, clear any existing code
      customer.verificationCode = undefined;
      customer.codeExpiresAt = undefined;
    }

    await customer.save();

    res.status(200).json({
      message: `Two-step verification has been ${enable ? 'enabled' : 'disabled'}.`,
      twoStepEnabled: customer.twoStepEnabled
    });

  } catch (error) {
    console.error('Toggle 2-step error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  verifyCode,
  toggleTwoStepVerification
};
