const Review = require("../models/Review");
const Booking = require("../models/Booking");

// ✅ Add review (only after booking completed)
const addReview = async (req, res) => {
  try {
    const { bookingId, customerId, laborId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "Completed") {
      return res.status(400).json({ error: "You can only review completed bookings" });
    }

    const review = new Review({
      bookingId,
      customerId,
      laborId,
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
