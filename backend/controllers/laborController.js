const Labor = require('../models/Labor');
const bcrypt = require('bcrypt');

// ✅ Register a labor
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

    // Validate required fields
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

    // Check if username already exists
    const existingUser = await Labor.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new labor user
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
    console.error('Error registering labor:', err);
    res.status(500).json({ error: 'Labor registration failed' });
  }
};

// ✅ Labor Dashboard Logic
const getLaborDashboardData = async (req, res) => {
  try {
    const laborId = req.user.id;

    // Fetch the logged-in labor's details (optional)
    const labor = await Labor.findById(laborId).select('-password'); // exclude password

    if (!labor) {
      return res.status(404).json({ error: 'Labor not found' });
    }

    res.status(200).json({
      message: 'Welcome to the Labor Dashboard',
      labor
    });
  } catch (err) {
    console.error('Error fetching labor dashboard:', err);
    res.status(500).json({ error: 'Failed to load labor dashboard' });
  }
};

module.exports = {
  registerLabor,
  getLaborDashboardData
};
