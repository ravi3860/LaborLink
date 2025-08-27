const Booking = require("../models/Booking");
const Labor = require("../models/Labor");

const validateBooking = async (req, res, next) => {
  try {
    const {
      customerId,
      laborId,
      service,
      bookingDate,
      bookingTime,
      paymentType,
      hours,
      days,
    } = req.body;

    // 1️⃣ Check required fields
    if (!customerId || !laborId || !service || !bookingDate || !bookingTime || !paymentType) {
      return res.status(400).json({ message: "Missing required booking fields." });
    }

    // 2️⃣ Validate date (cannot book in the past)
    const now = new Date();
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    if (bookingDateTime < now) {
      return res.status(400).json({ message: "Booking date/time cannot be in the past." });
    }

    // 3️⃣ Validate payment type
    const isHourly = paymentType.toLowerCase() === "hourly";
    const isDaily = paymentType.toLowerCase() === "daily";

    if (!isHourly && !isDaily) {
      return res.status(400).json({ message: "Invalid payment type. Must be 'hourly' or 'daily'." });
    }

    // 4️⃣ Validate duration
    if (isHourly && (!hours || hours <= 0)) {
      return res.status(400).json({ message: "Please provide valid number of hours." });
    }
    if (isDaily && (!days || days <= 0)) {
      return res.status(400).json({ message: "Please provide valid number of days." });
    }

    // 5️⃣ Check if labor exists and matches service
    const labor = await Labor.findById(laborId);
    if (!labor || labor.skillCategory !== service) {
      return res.status(400).json({ message: "Selected labor does not match service category." });
    }

    // 6️⃣ Check if labor accepts this payment type
    if (labor.paymentType.toLowerCase() !== paymentType.toLowerCase()) {
      return res.status(400).json({ message: `This labor only accepts ${labor.paymentType} bookings.` });
    }

    // 7️⃣ Prevent overlapping bookings for the same labor
    const conflict = await Booking.findOne({
      laborId,
      bookingDate,
      bookingTime,
      status: { $in: ["Pending", "Accepted", "Ongoing"] },
    });
    if (conflict) {
      return res.status(400).json({ message: "This labor is already booked at the selected time." });
    }

    // ✅ If all checks pass → continue
    next();
  } catch (error) {
    res.status(500).json({ message: "Validation error", error: error.message });
  }
};

module.exports = validateBooking;
