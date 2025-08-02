const getDashboardData = async (req, res) => {
  try {
    res.status(200).json({
      message: 'Admin dashboard accessed successfully',
      adminUsername: req.user.username,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load admin dashboard' });
  }
};

module.exports = {
  getDashboardData,
};