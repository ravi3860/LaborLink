const upload = require("../middleware/upload"); 
const express = require('express');
const { 
  registerCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { 
  registerLabor,
  updateLabor,
  deleteLabor,
  getAllServices,
  getLaborsByService,
  uploadLaborProfileImage
} = require('../controllers/laborController');

const { loginUser } = require('../controllers/loginController');

const {
  addReview,
  getReviewsForLabor
} = require('../controllers/reviewController');

const {
  addNotification,
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
  markAllAsRead
} = require('../controllers/notificationController');


const {
  verifyCode,
  toggleTwoStepVerification // import the new method
} = require('../controllers/verificationController');

const {
  createBooking,
  getBookingsByCustomer,
  getBookingsByLabor,
  getBookingAmount,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  clearHistory
} = require('../controllers/bookingController');

const {
  createPayment,
  markPaymentPaid,
  handleBookingDeclined
} = require('../controllers/paymentController');

// Subscription controllers
const {
  getSubscription,
  updateSubscription
} = require('../controllers/subscriptionController');

const { 
  getDashboardData,
  getAllBookings,
  getAllCustomers,
  getAllLabors,
  updateBookingStatusAsAdmin
} = require('../controllers/adminController');


const authMiddleware = require('../middleware/authMiddleware');
const validateBooking = require("../middleware/bookingValidation");

// Create a new router instance
const router = express.Router();

// Route for registering a customer    
router.post('/register/customer', registerCustomer);

// Route for updating a customer
router.put('/customers/update', updateCustomer);  

// Route for deleting a customer
router.delete('/customers/delete/:id', deleteCustomer);           

// Route for registering a labor
router.post('/register/labor', registerLabor);

// Route for updating a labor
router.put('/labors/update', updateLabor);

// Route for deleting a labor
router.delete('/labors/delete/:id', deleteLabor);

// GET all services
router.get('/services', getAllServices);

// GET labors by service
router.get('/labors/service/:skillCategory', getLaborsByService);

// POST /api/login
router.post('/login', loginUser);

// POST /api/verify-code
router.post('/verify-code', verifyCode);  

// ✅ PUT route for enabling/disabling 2-step verification
router.put(
  '/customer/two-step', 
  authMiddleware.verifyCustomer, // ensure only authenticated customer can toggle
  toggleTwoStepVerification
);

// Protected route: Get customer dashboard data
router.get(
  '/customer/dashboard', 
  authMiddleware.verifyCustomer, 
  require('../controllers/customerController').getDashboardData
);

// Protected route: Get labor dashboard data
router.get(
  '/labor/dashboard', 
  authMiddleware.verifyLabor, 
  require('../controllers/laborController').getLaborDashboardData
);

// Protected route: Get admin dashboard data
router.get(
  '/admin/dashboard', 
  authMiddleware.verifyAdmin, 
  require('../controllers/adminController').getDashboardData
);

// 📌 Create booking (customer)
router.post(
  '/bookings', 
  authMiddleware.verifyCustomer, 
  validateBooking,
  createBooking
);

// 📌 Get bookings for a customer
router.get(
  '/bookings/customer/:id', 
  authMiddleware.verifyCustomer, 
  getBookingsByCustomer
);

// Get a single booking by ID
router.get(
  '/bookings/:id', 
  authMiddleware.verifyCustomer,
  getBookingById
);

// 📌 Get bookings for a labor
router.get(
  '/bookings/labor/:id', 
  authMiddleware.verifyLabor, 
  getBookingsByLabor
);

// 📌 Update booking status (labor accepts/declines/completes)
router.patch(
  '/bookings/:id/status', 
  authMiddleware.verifyLabor, 
  updateBookingStatus
);

// 📌 Delete a booking (customer cancels)
router.delete(
  '/bookings/:id', 
  authMiddleware.verifyCustomer, 
  deleteBooking
);

router.post('/payments', 
  authMiddleware.verifyCustomer, 
  createPayment);

// Mark payment as paid (Customer)
router.patch('/payments/:paymentId/paid', 
  authMiddleware.verifyCustomer, 
  markPaymentPaid);

router.post(
  "/labors/:id/upload-profile",
  authMiddleware.verifyLabor,
  upload.single("profileImage"),
  uploadLaborProfileImage
);

// Clear labor booking history
router.delete(
  '/bookings/labor/history/clear', 
  authMiddleware.verifyLabor, 
  clearHistory
);

// Get current subscription
router.get(
  '/subscriptions/:customerId', 
  authMiddleware.verifyCustomer, 
  getSubscription
);

// Update/upgrade subscription
router.put(
  '/subscriptions/:customerId', 
  authMiddleware.verifyCustomer, 
  updateSubscription
);

router.get(
  '/bookings/:bookingId/amount', 
  authMiddleware.verifyLabor, 
  getBookingAmount
);

router.get('/bookings', 
  authMiddleware.verifyAdmin, 
  getAllBookings);

router.get('/customers', 
  authMiddleware.verifyAdmin, 
  getAllCustomers);
  
router.get('/labors', 
  authMiddleware.verifyAdmin, 
  getAllLabors);

  router.patch(
  '/admin/bookings/:id/status',
  authMiddleware.verifyAdmin,
  updateBookingStatusAsAdmin
);

router.post(
  '/reviews', 
  authMiddleware.verifyCustomer, 
  addReview
);


router.get(
  '/reviews/:laborId', 
  authMiddleware.verifyCustomer, 
  getReviewsForLabor
);

//Tempory
router.post('/notifications', authMiddleware.verifyCustomer, createNotification);

// Notification routes
router.get(
  '/notifications', 
  authMiddleware.verifyCustomer, // or verifyLabor/admin depending on role
  getNotifications
);

router.patch(
  '/notifications/:notificationId/read',
  authMiddleware.verifyCustomer,
  markAsRead
);

router.delete(
  '/notifications/:notificationId',
  authMiddleware.verifyCustomer,
  deleteNotification
);

router.delete(
  '/notifications',
  authMiddleware.verifyCustomer,
  clearAllNotifications
);

// routes/authRoutes.js
router.patch(
  '/notifications/mark-all-read',
  authMiddleware.verifyCustomer,
  markAllAsRead
);

module.exports = router;
