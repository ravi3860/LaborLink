const Customer = require('../models/Customer');
const Labor = require('../models/Labor');
const Admin = require('../models/Admin'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// You should have this secret in your environment variables for security
const JWT_SECRET = process.env.JWT_SECRET;

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

    // Create payload for JWT
    const payload = {
      id: user._id,
      username: user.username,
      role: role,
    };

    // Sign the token (expires in 1 day)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    // Return token along with user info (excluding password)
    res.status(200).json({ 
      message: `${role} login successful`, 
      token, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: role,
        // any other user fields you want to send
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
    loginUser
};
