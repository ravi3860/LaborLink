const Booking = require('../models/Booking');
const Labor = require('../models/Labor');
const nodemailer = require('nodemailer');

// Setup NodeMailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1️⃣ Create a new booking
const createBooking = async (req, res) => {
    try {
        const {
            customerId,
            laborId,
            customerName,
            customerEmail,
            customerPhone,
            service,
            bookingDate,
            bookingTime,
            locationAddress,
            locationCoordinates,
            notes,
            paymentType,
            hours,
            days
        } = req.body;

        // Fetch labor
        const labor = await Labor.findById(laborId);
        if (!labor || labor.skillCategory !== service) {
            return res.status(400).json({ message: 'Selected labor does not match the service category.' });
        }

        // Check labor payment type (case-insensitive)
        if (labor.paymentType.toLowerCase() !== paymentType.toLowerCase()) {
            return res.status(400).json({ message: `This labor only accepts ${labor.paymentType} bookings.` });
        }

        // Validate duration
        const isHourly = paymentType.toLowerCase() === 'hourly';
        const isDaily = paymentType.toLowerCase() === 'daily';

        if (isHourly && (!hours || hours <= 0)) {
            return res.status(400).json({ message: 'Please specify a valid number of hours.' });
        }
        if (isDaily && (!days || days <= 0)) {
            return res.status(400).json({ message: 'Please specify a valid number of days.' });
        }

        // Calculate total amount
        const serviceCharge = 1000;
        const laborRate = labor.paymentRate; // Correct field from Labor model
        let totalAmount = 0;

        if (isHourly) totalAmount = (hours * laborRate) + serviceCharge;
        if (isDaily) totalAmount = (days * laborRate) + serviceCharge;

        // Create booking
        const booking = new Booking({
            customerId,
            laborId,
            customerName,
            customerEmail,
            customerPhone,
            service,
            bookingDate,
            bookingTime,
            locationAddress,
            locationCoordinates,
            notes,
            paymentType,
            hours: isHourly ? hours : 0,
            days: isDaily ? days : 0,
            laborRate,
            serviceCharge,
            totalAmount
        });

        await booking.save();
        res.status(201).json({ message: 'Booking created successfully', booking, totalAmount });
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

// 2️⃣ Get bookings by customer
const getBookingsByCustomer = async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.params.id })
            .populate('laborId', 'name skillCategory email phone');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings for customer', error: error.message });
    }
};

// 3️⃣ Get bookings by labor
const getBookingsByLabor = async (req, res) => {
    try {
        const bookings = await Booking.find({ laborId: req.params.id })
            .populate('customerId', 'name email phone');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings for labor', error: error.message });
    }
};

// 4️⃣ Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { status, reason } = req.body; // reason is for decline
        const booking = await Booking.findById(req.params.id).populate('laborId');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // ✅ Decline by labor
        if (status === 'Cancelled') {
            booking.status = 'Cancelled';
            booking.declineReason = reason || 'No reason provided';
            await booking.save();

            // Send email to customer
            const mailOptions = {
            from: `"LaborLink" <${process.env.EMAIL_USER}>`,
            to: booking.customerEmail,
            subject: '❌ Your Booking Has Been Cancelled',
            html: `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f4; padding:30px 0;">
                <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #ddd; font-family:Arial, sans-serif;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background:#e63946; padding:30px;">
                        <img src="https://img.icons8.com/ios-filled/80/ffffff/cancel.png" width="60" alt="Cancelled" style="display:block;" />
                        <h2 style="color:#ffffff; margin:15px 0 0; font-size:24px;">Booking Cancelled</h2>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:30px; color:#333333; text-align:left; font-size:15px;">
                        <p>Hello <strong>${booking.customerName}</strong>,</p>
                        <p>We regret to inform you that your booking with <b>${booking.laborId.name}</b> has been <span style="color:#e63946; font-weight:bold;">cancelled</span>.</p>
                        
                        <p><b>Reason:</b> ${booking.declineReason || 'No reason provided'} </p>

                        <div style="background:#fff5f5; border-left:5px solid #e63946; padding:15px; margin:20px 0; border-radius:6px;">
                            <p style="margin:0; font-size:14px;">We apologize for any inconvenience caused. You may book another labor through our platform at any time.</p>
                        </div>
                        
                        <p style="margin-top:20px;">Thank you for using <b>LaborLink</b>.</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#777;">
                        © ${new Date().getFullYear()} LaborLink | Booking Notifications
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
            `
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) console.error('Email error:', err);
                else console.log('Decline email sent:', info.response);
            });

            return res.status(200).json({ message: 'Booking cancelled and customer notified via email', booking });
        }

        // ✅ Accept by labor → pending payment
        if (status === 'Accepted') {
            booking.status = 'Accepted';
            await booking.save();
            return res.status(200).json({ message: 'Booking accepted by labor', booking });
        }

        // ✅ Payment completed → ongoing
        if (status === 'Ongoing') {
            booking.status = 'Ongoing';
            await booking.save();
            return res.status(200).json({ message: 'Booking is now ongoing', booking });
        }

        // ✅ Work completed → completed
        if (status === 'Completed') {
            booking.status = 'Completed';
            await booking.save();
            return res.status(200).json({ message: 'Booking completed', booking });
        }

        

        res.status(400).json({ message: 'Invalid status update' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking status', error: error.message });
    }
};

// 5️⃣ Delete a booking
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting booking', error: error.message });
    }
};

module.exports = {
    createBooking,
    getBookingsByCustomer,
    getBookingsByLabor,
    updateBookingStatus,
    deleteBooking
};
