const Review = require("../models/Review");
const Booking = require("../models/Booking");

const addReview = async (req, res) => {
  try {
    const customerId = req.user.id; // logged-in customer
    const { bookingId, rating, comment } = req.body;

    // 1️⃣ Check booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // 2️⃣ Ensure booking is completed
    if (booking.status !== "Completed")
      return res.status(400).json({ error: "You can only review completed bookings" });

    // 3️⃣ Ensure booking belongs to customer
    if (booking.customerId.toString() !== customerId)
      return res.status(403).json({ error: "You can only review your own bookings" });

    // 4️⃣ Prevent duplicate review
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview)
      return res.status(400).json({ error: "You have already reviewed this booking" });

    // 5️⃣ Save review
    const review = new Review({
      bookingId,
      customerId,
      laborId: booking.laborId,
      rating,
      comment,
    });
    await review.save();

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    res.status(500).json({ error: "Failed to add review", details: err.message });
  }
};


// ✅ Get reviews for a labor
const getReviewsForLabor = async (req, res) => {
  try {
    const { laborId } = req.params;

    const reviews = await Review.find({ laborId })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews", details: err.message });
  }
};

module.exports = { addReview, getReviewsForLabor };
