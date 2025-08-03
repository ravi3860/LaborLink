const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

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

module.exports = {
  verifyCode
};
