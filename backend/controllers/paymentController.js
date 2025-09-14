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
    let rate = labor.paymentRate;

    if (!duration || duration <= 0) {
      return res.status(400).json({
        message: `Please specify valid number of ${booking.paymentType.toLowerCase() === 'hourly' ? 'hours' : 'days'}.`
      });
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
      status: paymentMethod === 'cash' ? 'pending' : 'pending'
    });

    // Card/online payment processing
    if (paymentMethod === 'card' || paymentMethod === 'online') {
      if (!cardDetails) {
        return res.status(400).json({ message: 'Card details required for card/online payment.' });
      }
      payment.status = 'paid';
      booking.status = 'Ongoing';
    }

    // Cash payment stays pending until completed
    if (paymentMethod === 'cash') {
      payment.status = 'pending';
      booking.status = 'Ongoing';
    }

    await payment.save();
    booking.payment = payment._id;
    await booking.save();

    // Email notifications
    let subject, htmlContent;

    if (paymentMethod === 'card' || paymentMethod === 'online') {
      subject = '✅ Payment Successful';
      htmlContent = `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f4; padding:30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #ddd; font-family:Arial, sans-serif;">
              <tr>
                <td align="center" style="background:#2d6a4f; padding:30px;">
                  <img src="https://img.icons8.com/ios-filled/80/ffffff/money.png" width="60" alt="Paid" style="display:block;" />
                  <h2 style="color:#ffffff; margin:15px 0 0; font-size:24px;">Payment Successful</h2>
                </td>
              </tr>
              <tr>
                <td style="padding:30px; color:#333333; font-size:15px;">
                  <p>Hello <strong>${booking.customerId.name}</strong>,</p>
                  <p>Your payment of <b>LKR ${payment.totalAmount}</b> for this booking has been <strong>successfully received</strong>.</p>
                  <div style="background:#f0fff4; border-left:5px solid #2d6a4f; padding:15px; margin:20px 0; border-radius:6px;">
                    <p style="margin:0; font-size:14px;"><b>Booking Status:</b> ${booking.status}</p>
                    <p style="margin:0; font-size:14px;"><b>Payment Method:</b> ${payment.paymentMethod}</p>
                  </div>
                  <p>Thank you for choosing <b>LaborLink</b>. Your labor will begin work shortly.</p>
                </td>
              </tr>
              <tr>
                <td style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#777;">
                  © ${new Date().getFullYear()} LaborLink | Payment Notifications
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `;
    } else if (paymentMethod === 'cash') {
      subject = '⏳ Payment Pending (Cash)';
      htmlContent = `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f4; padding:30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #ddd; font-family:Arial, sans-serif;">
              <tr>
                <td align="center" style="background:#ffb703; padding:30px;">
                  <img src="https://img.icons8.com/ios-filled/80/ffffff/wallet.png" width="60" alt="Cash Payment" style="display:block;" />
                  <h2 style="color:#ffffff; margin:15px 0 0; font-size:24px;">Payment Pending</h2>
                </td>
              </tr>
              <tr>
                <td style="padding:30px; color:#333333; font-size:15px;">
                  <p>Hello <strong>${booking.customerId.name}</strong>,</p>
                  <p>Your booking is confirmed. Total payment: <b>LKR ${payment.totalAmount}</b>.</p>
                  <p>Please pay in cash directly to the labor after work completion.</p>
                  <div style="background:#fff9e6; border-left:5px solid #ffb703; padding:15px; margin:20px 0; border-radius:6px;">
                    <p style="margin:0; font-size:14px;"><b>Booking Status:</b> ${booking.status}</p>
                    <p style="margin:0; font-size:14px;"><b>Payment Method:</b> ${payment.paymentMethod}</p>
                  </div>
                  <p>Thank you for choosing <b>LaborLink</b>.</p>
                </td>
              </tr>
              <tr>
                <td style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#777;">
                  © ${new Date().getFullYear()} LaborLink | Payment Notifications
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `;
    }

    await transporter.sendMail({
      from: `"LaborLink" <${process.env.EMAIL_USER}>`,
      to: booking.customerId.email,
      subject,
      html: htmlContent
    });

    res.status(201).json({ 
      message: 'Payment record created', 
      payment, 
      booking: await Booking.findById(booking._id).populate('laborId customerId payment') 
    });

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
        from: `"LaborLink" <${process.env.EMAIL_USER}>`,
        to: payment.customerId.email,
        subject: '✅ Payment Successful',
        html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f4; padding:30px 0;">
            <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #ddd; font-family:Arial, sans-serif;">
                
                <!-- Header -->
                <tr>
                    <td align="center" style="background:#2d6a4f; padding:30px;">
                    <img src="https://img.icons8.com/ios-filled/80/ffffff/money.png" width="60" alt="Paid" style="display:block;" />
                    <h2 style="color:#ffffff; margin:15px 0 0; font-size:24px;">Payment Successful</h2>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:30px; color:#333333; font-size:15px;">
                    <p>Hello <strong>${payment.customerId.name}</strong>,</p>
                    <p>Your payment of <b>LKR ${payment.totalAmount}</b> for your booking has been <strong>successfully received</strong>.</p>

                    <div style="background:#f0fff4; border-left:5px solid #2d6a4f; padding:15px; margin:20px 0; border-radius:6px;">
                        <p style="margin:0; font-size:14px;"><b>Booking Status:</b> ${booking.status}</p>
                        <p style="margin:0; font-size:14px;"><b>Payment Method:</b> ${payment.paymentMethod}</p>
                    </div>

                    <p>Thank you for choosing <b>LaborLink</b>. Your labor will begin work shortly.</p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#777;">
                    © ${new Date().getFullYear()} LaborLink | Payment Notifications
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        `
        });


        res.status(200).json({ message: 'Payment marked as paid', payment, booking: await Booking.findById(booking._id)
    .populate('laborId customerId payment') });
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
        from: `"LaborLink" <${process.env.EMAIL_USER}>`,
        to: booking.customerId.email,
        subject: '❌ Booking Cancelled',
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
                    <td style="padding:30px; color:#333333; font-size:15px;">
                    <p>Hello <strong>${booking.customerId.name}</strong>,</p>
                    <p>Your booking has been <strong style="color:#e63946;">cancelled</strong> by the labor.</p>

                    <div style="background:#fff5f5; border-left:5px solid #e63946; padding:15px; margin:20px 0; border-radius:6px;">
                        <p style="margin:0; font-size:14px;"><b>Reason:</b> ${reason}</p>
                    </div>

                    <p>No payment was processed. If any amount was charged, it will be refunded within 3–5 business days.</p>
                    <p>We encourage you to book another labor through <b>LaborLink</b>.</p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#777;">
                    © ${new Date().getFullYear()} LaborLink | Payment Notifications
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        `
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
