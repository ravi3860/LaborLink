import Subscription from "../models/Subscription.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

// Plan configuration with booking limits and company fees
const planConfig = {
  free: { bookingLimit: 10, companyFee: 1000 },
  basic: { bookingLimit: 30, companyFee: 500 },
  premium: { bookingLimit: Infinity, companyFee: 0 }
};

// Assign default Free subscription on customer registration
export const assignDefaultSubscription = async (customerId) => {
  try {
    const existing = await Subscription.findOne({ customerId, isActive: true });
    if (existing) return;

    const newSub = new Subscription({
      customerId,
      planType: "free",
      bookingLimit: planConfig.free.bookingLimit
    });
    await newSub.save();
  } catch (err) {
    console.error("Error assigning default subscription:", err.message);
  }
};

// Get current active subscription
export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      customerId: req.params.customerId,
      isActive: true
    });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    res.json(subscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update or upgrade subscription
export const updateSubscription = async (req, res) => {
  const { planType } = req.body;

  if (!planConfig[planType]) {
    return res.status(400).json({ message: "Invalid plan type" });
  }

  try {
    let subscription = await Subscription.findOne({
      customerId: req.params.customerId,
      isActive: true
    });

    if (!subscription) {
      subscription = new Subscription({
        customerId: req.params.customerId,
        planType,
        bookingLimit: planConfig[planType].bookingLimit
      });
    } else {
      subscription.planType = planType;
      subscription.bookingLimit = planConfig[planType].bookingLimit;
    }

    await subscription.save();
    res.json({ message: "Subscription updated", subscription });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Middleware to check booking limit and inject company fee
export const checkBookingLimit = async (req, res, next) => {
  try {
    const customerId = req.user.id; // from auth middleware
    const subscription = await Subscription.findOne({
      customerId,
      isActive: true
    });

    if (!subscription) {
      return res.status(403).json({ message: "No active subscription. Please subscribe." });
    }

    // Count current month bookings
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentMonthBookings = await Booking.countDocuments({
      customerId,
      createdAt: { $gte: startOfMonth }
    });

    if (currentMonthBookings >= subscription.bookingLimit) {
      return res.status(403).json({ message: "Booking limit exceeded. Upgrade your subscription." });
    }

    // Inject company fee into request for payment creation
    req.companyFee = planConfig[subscription.planType].companyFee;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
