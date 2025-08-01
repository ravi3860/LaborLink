const Customer = require('../models/Customer');
const Labor = require('../models/Labor');
const Admin = require('../models/Admin'); 
const bcrypt = require('bcrypt');

// Common login function
const loginUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let user;

    // Role-based user search
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

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    res.status(200).json({ message: `${role} login successful`, user });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
    loginUser
};