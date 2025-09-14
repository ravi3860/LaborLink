const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  planType: {
    type: String,
    enum: ["free", "basic", "premium"],
    default: "free"
  },
  bookingLimit: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
