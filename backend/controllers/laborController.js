const Labor = require('../models/Labor');
const bcrypt = require('bcrypt');

// Register a labor
const registerLabor = async (req, res) => {
  try {
    const { name, username, password, email, address, phone, ageCategory, skillCategory } = req.body;

    // Validate ageCategory is provided
    if (!ageCategory || ageCategory === '') {
      return res.status(400).json({ error: 'Age category is required and must be valid' });
    }
    
    //existing username check
    const existingUser = await Labor.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newLabor = new Labor({ name, username, password: hashedPassword, email, address, phone, ageCategory, skillCategory });
    await newLabor.save();

    res.status(201).json({ message: 'Labor registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Labor registration failed' });
  }
};

// Export the Laborcontroller function
module.exports = {
  registerLabor
};