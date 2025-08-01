const Labor = require('../models/Labor');
const bcrypt = require('bcrypt');

// Register a labor
const registerLabor = async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      email,
      address,
      phone,
      ageCategory,
      skillCategory
    } = req.body;

    // ✅ Validate all required fields
    if (
      !name ||
      !username ||
      !password ||
      !email ||
      !address ||
      !phone ||
      !ageCategory ||
      !skillCategory
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // ✅ Check for existing username
    const existingUser = await Labor.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new Labor
    const newLabor = new Labor({
      name,
      username,
      password: hashedPassword,
      email,
      address,
      phone,
      ageCategory,
      skillCategory
    });

    await newLabor.save();

    res.status(201).json({ message: 'Labor registered successfully' });

  } catch (err) {
    console.error('Error registering labor:', err); // 🔍 Detailed error logging
    res.status(500).json({ error: 'Labor registration failed' });
  }
};

module.exports = {
  registerLabor
};