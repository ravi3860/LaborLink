const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    laborId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Labor',
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerEmail: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true
    },
    service: {
        type: String,
        required: true,
        enum: [
            'Masons',
            'Electricians',
            'Plumbers',
            'Painters',
            'Carpenters',
            'Tile Layers',
            'Welders',
            'Roofers',
            'Helpers/General Labourers',
            'Scaffolders'
        ],
        trim: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    bookingTime: {
        type: String,
        required: true,
        trim: true
    },
    locationAddress: {
        type: String,
        required: true,
        trim: true
    },
    locationCoordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    paymentType: {
        type: String,
        enum: ['Hourly', 'Daily'],
        required: true
    },
    hours: { type: Number, default: 0 },
    days: { type: Number, default: 0 },
    laborRate: { type: Number, required: true },
    serviceCharge: { type: Number, default: 1000 },
    totalAmount: { type: Number, required: true },

    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Pending'
    },

    declineReason: { // ✅ Added decline reason
        type: String,
        trim: true,
        default: ''
    },

    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
