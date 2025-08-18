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
      skillCategory,
      description,
      yearsOfExperience,
      projects,
      paymentType,
      paymentRate,
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
      !skillCategory ||
      !description  ||
      !paymentType ||
      !paymentRate
    ) {
      return res.status(400).json({ error: 'All required fields must be filled' });
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
      skillCategory,
      description: description || '',
      yearsOfExperience: yearsOfExperience || 0,
      projects: projects || [], 
      paymentType: paymentType || '',
      paymentRate: paymentRate || 0
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

// PUT /api/labors/update
const updateLabor = async (req, res) => {
  try {
    const {
      _id,
      name,
      email,
      username,
      address,
      phone,
      ageCategory,
      skillCategory,
      yearsOfExperience,
      projects,
      paymentType,
      paymentRate,
      description
    } = req.body;

    const updatedLabor = await Labor.findByIdAndUpdate(
      _id,
      {
        name,
        email,
        username,
        address,
        phone,
        ageCategory,
        skillCategory,
        description: description || '',
        yearsOfExperience: yearsOfExperience || 0,
        projects: projects || [],
        paymentType: paymentType || '',
        paymentRate: paymentRate || 0
      },
      { new: true }
    );

    res.json({ success: true, updatedLabor });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update details' });
  }
};

// DELETE /api/labors/delete/:id
const deleteLabor = async (req, res) => {
  try {
    await Labor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
};

module.exports = {
  registerLabor,
  getLaborDashboardData,
  updateLabor,
  deleteLabor
};
