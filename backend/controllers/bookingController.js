const Booking = require('../models/Booking'); 
const Labor = require('../models/Labor');
const Subscription = require('../models/Subscription');
const nodemailer = require('nodemailer');
const { addNotification } = require('../controllers/notificationController');

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
        await addNotification(
          customerId,
          'Customer',
          `Your booking with ${labor.name} is created and is now pending approval.`
        );
        res.status(201).json({ message: 'Booking created successfully', booking, totalAmount });
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

// 2️⃣ Get bookings by customer
const getBookingsByCustomer = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.params.id })
      .populate('laborId', 'name skillCategory email phone')
      .populate('payment'); // ✅ Now include payment info
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer bookings', error });
  }
};

// 3️⃣ Get bookings by labor
const getBookingsByLabor = async (req, res) => {
    try {
        const bookings = await Booking.find({ laborId: req.params.id })
            .populate('customerId', 'name email phone')
            .populate('payment'); 
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings for labor', error: error.message });
    }
};

// 4️⃣ Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { status, declineReason } = req.body; // ✅ use declineReason
        const booking = await Booking.findById(req.params.id).populate('laborId');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const normalizedStatus = status.toLowerCase();

        // ✅ Handle Completed
        if (normalizedStatus === 'completed') {
            await booking.populate('payment'); // ensure payment details are loaded

            // Payment record must exist
            if (!booking.payment) {
                return res.status(400).json({
                    message: 'Cannot complete booking: payment not recorded yet.'
                });
            }

            // Card payment: only complete if paid
            if (booking.payment.method === 'card' && booking.payment.status !== 'paid') {
                return res.status(400).json({
                    message: 'Card payment not completed. Cannot mark booking as completed.'
                });
            }

            // Cash payment: auto-mark as paid when labor clicks "Completed"
            if (booking.payment.method === 'cash' && booking.payment.status !== 'paid') {
                booking.payment.status = 'paid';
                booking.payment.paidAt = new Date();
                if (booking.payment.save) await booking.payment.save(); // save sub-document if Mongoose
            }

            booking.status = 'Completed';
            await booking.save();
            const reviewLink = `/customer/review/${booking.customerId._id || booking.customerId}/${booking.laborId._id || booking.laborId}/${booking._id}`;
            await addNotification(
              booking.customerId,
              'Customer',
              `Your booking with ${booking.laborId.name} has been completed. Please leave a review.`,
              'info',
              reviewLink
            );
            return res.status(200).json({ message: 'Booking completed', booking });
        }

        // ✅ Decline by labor
        if (normalizedStatus === 'cancelled') {
            booking.status = 'Cancelled';
            booking.declineReason = declineReason || 'No reason provided';
            await booking.save();
            await addNotification(
            booking.customerId,
            'Customer',
            `Unfortunately, your booking with ${booking.laborId.name} has been cancelled.`
            );

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

        if (normalizedStatus === 'accepted') {
            booking.status = 'Accepted';
            await booking.save();
            await addNotification(
              booking.customerId,
              'Customer',
              `Your booking with ${booking.laborId.name} has been accepted. Please proceed to payment.`
            );
            return res.status(200).json({ message: 'Booking accepted by labor', booking });
        }

        // ✅ Ongoing
        if (normalizedStatus === 'ongoing') {
            booking.status = 'Ongoing';
            await booking.save();
            await addNotification(
              booking.customerId,
              'Customer',
              `Your booking with ${booking.laborId.name} is now ongoing.`
            );
            return res.status(200).json({ message: 'Booking is now ongoing', booking });
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

// Get single booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('laborId', 'name skillCategory email phone');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Ensure the customer owns this booking
    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching booking', error: err.message });
  }
};

// Clear Completed or Cancelled bookings for a labor
const clearHistory = async (req, res) => {
  try {
    const laborId = req.user.id; // labor is authenticated

    // Delete bookings with status Completed or Cancelled
    const result = await Booking.deleteMany({ 
      laborId, 
      status: { $in: ['Completed', 'Cancelled'] }
    });

    res.status(200).json({ 
      message: `${result.deletedCount} past bookings cleared successfully.` 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing booking history', error: error.message });
  }
};

const getBookingAmount = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("customerId", "name email")
      .populate("laborId", "name paymentRate");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // base calculation
    const rate = booking.laborId?.paymentRate || booking.laborRate || 0;
    const hours = booking.hours || 0;
    const days = booking.days || 0;
    const type = (booking.paymentType || "hourly").toLowerCase();

    // company fee logic
    let companyFee = 1000; // default
    const customerId = booking.customerId?._id || booking.customerId;

    if (customerId) {
      const subscription = await Subscription.findOne({ customerId });

      if (subscription) {
        if (subscription.companyFee !== undefined && subscription.companyFee !== null) {
          companyFee = subscription.companyFee;
        } else {
          companyFee =
            subscription.planType === "free" ? 1000 :
            subscription.planType === "basic" ? 500 :
            0;
        }
      }
    }

    // final amount
    const amount =
      type === "hourly" ? rate * hours + companyFee : rate * days + companyFee;

    res.json({ amount, bookingId, companyFee });
  } catch (err) {
    console.error("Error in getBookingAmount:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


module.exports = {
    createBooking,
    getBookingsByCustomer,
    getBookingsByLabor,
    getBookingAmount,
    clearHistory,
    getBookingById,
    updateBookingStatus,
    deleteBooking
};
