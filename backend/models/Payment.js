const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  laborId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Labor',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  paymentType: {
    type: String,
    enum: ['Hourly', 'Daily'],
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  companyFee: {
    type: Number,
    default: 1000
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
