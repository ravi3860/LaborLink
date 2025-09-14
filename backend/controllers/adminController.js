const Customer = require('../models/Customer');
const Labor = require('../models/Labor');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking'); // assuming you have a Booking model

const getDashboardData = async (req, res) => {
  try {
    const customerCount = await Customer.countDocuments();
    const laborCount = await Labor.countDocuments();
    const adminCount = await Admin.countDocuments();

    res.status(200).json({
      success: true,
      adminUsername: req.user.username,
      customerCount,
      laborCount,
      adminCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load admin dashboard' });
  }
};

// --- NEW METHODS ---
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('customerId laborId'); // include customer & labor info
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();

    // For each customer, count their bookings
    const customersWithCounts = await Promise.all(
      customers.map(async (c) => {
        const bookingCount = await Booking.countDocuments({ customerId: c._id });
        return { ...c.toObject(), totalBookings: bookingCount };
      })
    );

    res.status(200).json({ success: true, customers: customersWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};


const getAllLabors = async (req, res) => {
  try {
    const labors = await Labor.find();

    // For each labor, count their bookings
    const laborsWithCounts = await Promise.all(
      labors.map(async (l) => {
        const bookingCount = await Booking.countDocuments({ laborId: l._id });
        return { ...l.toObject(), totalBookings: bookingCount };
      })
    );

    res.status(200).json({ success: true, labors: laborsWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch labors' });
  }
};

// In adminController.js or bookingController.js
const updateBookingStatusAsAdmin = async (req, res) => {
    try {
        const { status, declineReason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const normalizedStatus = status.toLowerCase();

        // Admin can update freely
        booking.status = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
        if (normalizedStatus === 'cancelled') {
            booking.declineReason = declineReason || 'No reason provided';
        }

        await booking.save();

        res.status(200).json({ success: true, updatedBooking: booking });
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking status', error: error.message });
    }
};


module.exports = {
  getDashboardData,
  getAllBookings,
  getAllCustomers,
  getAllLabors,
  updateBookingStatusAsAdmin
};
