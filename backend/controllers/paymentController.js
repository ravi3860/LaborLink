const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Labor = require('../models/Labor');
const Customer = require('../models/Customer');
const nodemailer = require('nodemailer');

// Configure NodeMailer (adjust credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 📌 Create payment after labor accepts booking
// 📌 Create payment after labor accepts booking
const createPayment = async (req, res) => {
    try {
        const { bookingId, duration, paymentMethod, cardDetails } = req.body;

        const booking = await Booking.findById(bookingId).populate('laborId customerId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'Accepted') {
            return res.status(400).json({ message: 'Payment can only be made after labor accepts the booking.' });
        }

        const labor = booking.laborId;
        const companyFee = 1000;
        let rate = labor.paymentRate; // hourly or daily rate

        // Validate duration
        if (!duration || duration <= 0) {
            return res.status(400).json({ message: `Please specify valid number of ${booking.paymentType.toLowerCase() === 'hourly' ? 'hours' : 'days'}.` });
        }

        const totalAmount = rate * duration + companyFee;

        const payment = new Payment({
            bookingId: booking._id,
            customerId: booking.customerId._id,
            laborId: labor._id,
            paymentType: booking.paymentType,
            rate,
            duration,
            companyFee,
            totalAmount,
            paymentMethod,
            status: 'pending'
        });

        // ✅ Card or online payment auto-processed
        if (paymentMethod === 'card' || paymentMethod === 'online') {
            if (!cardDetails) {
                return res.status(400).json({ message: 'Card details required for card/online payment.' });
            }

            // Integrate your payment gateway here (Stripe/PayPal)
            // For now, we simulate success:
            payment.status = 'paid';
            booking.status = 'Ongoing';
            await booking.save();
        }

        await payment.save();

        // Send email notification
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: booking.customerId.email,
            subject: `Payment ${payment.status === 'paid' ? 'Successful' : 'Pending'}`,
            html: `<p>Your payment of LKR ${payment.totalAmount} for booking has been ${payment.status}.</p>
                   <p>Booking status: <strong>${booking.status}</strong></p>`
        });

        res.status(201).json({ message: 'Payment record created', payment, booking });
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
};



// 📌 Mark payment as paid
const markPaymentPaid = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId).populate('customerId laborId bookingId');
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        const booking = await Booking.findById(payment.bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (payment.paymentMethod === 'cash') {
            if (booking.status !== 'Completed') {
                return res.status(400).json({ message: 'Cash payment can only be marked as paid after the booking is completed by labor.' });
            }
        } else if (payment.paymentMethod === 'card' || payment.paymentMethod === 'online') {
            if (payment.status === 'paid') {
                return res.status(400).json({ message: 'Payment is already marked as paid.' });
            }
            // Here, integrate with real payment gateway if needed
        }

        payment.status = 'paid';
        await payment.save();

        // For card/online, update booking to ongoing
        if (payment.paymentMethod !== 'cash') {
            booking.status = 'Ongoing';
            await booking.save();
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: payment.customerId.email,
            subject: 'Payment Successful',
            html: `<p>Your payment of LKR ${payment.totalAmount} for booking has been received successfully.</p>
                   <p>Booking is now <strong>${booking.status}</strong>.</p>`
        });

        res.status(200).json({ message: 'Payment marked as paid', payment, booking });
    } catch (error) {
        res.status(500).json({ message: 'Error marking payment', error: error.message });
    }
};


// 📌 Handle booking declined by labor
const handleBookingDeclined = async (bookingId, reason = 'No reason provided') => {
    try {
        const booking = await Booking.findById(bookingId).populate('customerId');
        if (!booking) return;

        // Update booking status
        booking.status = 'Cancelled';
        await booking.save();

        // Cancel any existing payment
        const payment = await Payment.findOne({ bookingId: booking._id });
        if (payment) {
            payment.status = 'cancelled';
            await payment.save();
        }

        // Send email to customer
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: booking.customerId.email,
            subject: 'Booking Cancelled',
            html: `<p>Your booking has been cancelled by the labor.</p>
                   <p>Reason: ${reason}</p>`
        });

    } catch (error) {
        console.error('Error handling declined booking:', error.message);
    }
};

module.exports = {
    createPayment,
    markPaymentPaid,
    handleBookingDeclined
};
