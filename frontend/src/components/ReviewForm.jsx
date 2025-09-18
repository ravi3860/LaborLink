import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "./ReviewForm.css"; // Import the CSS file

const ReviewForm = () => {
  const { customerId: paramCustomerId, laborId: paramLaborId, bookingId: paramBookingId } = useParams();
  const location = useLocation();
  const { customerId: stateCustomerId, laborId: stateLaborId, bookingId: stateBookingId } = location.state || {};

  // Use state if available, otherwise fallback to params
  const customerId = stateCustomerId || paramCustomerId;
  const laborId = stateLaborId || paramLaborId;
  const bookingId = stateBookingId || paramBookingId;

  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  

  // Fetch existing reviews for this labor
  useEffect(() => {
    const fetchReviews = async () => {
      if (!laborId) return;
      try {
        const res = await axios.get(
          `http://localhost:2000/api/laborlink/reviews/${laborId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setReviews(res.data || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchReviews();
  }, [laborId]);

  // Submit new review
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `http://localhost:2000/api/laborlink/reviews`,
        { bookingId, rating, comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      alert("Review submitted successfully!");
      setShowModal(false);
      setRating(0);
      setComment("");

      // Refresh reviews
      setReviews((prev) => [
        ...prev,
        { customerId: { name: "You" }, rating, comment, createdAt: new Date() },
      ]);
    } catch (err) {
      console.error("Error submitting review:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  if (!customerId || !laborId || !bookingId) {
    return <p className="review-error">Invalid review request. Please go through your bookings.</p>;
  }

  return (
    <div className="review-section">
      <h2 className="review-title">Customer Reviews</h2>

      {/* List Reviews */}
      {reviews.length === 0 ? (
        <p className="review-empty">No reviews yet.</p>
      ) : (
        <ul className="review-list">
          {reviews.map((rev, idx) => (
            <li key={idx} className="review-item">
              <p className="review-name">{rev.customerId?.name}</p>
              <p className="review-stars">
                {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
              </p>
              <p className="review-comment">{rev.comment}</p>
              <p className="review-date">
                {new Date(rev.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Review Button */}
      <button onClick={() => setShowModal(true)} className="review-btn">
        Leave a Review
      </button>

      {/* Review Modal */}
      {showModal && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <h3 className="modal-title">Leave a Review</h3>
            <form onSubmit={handleSubmit}>
              {/* Rating */}
              <div className="modal-field">
                <label className="modal-label">Rating</label>
                <div className="modal-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      className={`star ${rating >= star ? "active" : ""}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="modal-field">
                <label className="modal-label">Comment</label>
                <textarea
                  className="modal-textarea"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="modal-submit"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;
