const express = require('express');
const { 
  registerCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { 
  registerLabor,
  updateLabor,
  deleteLabor
} = require('../controllers/laborController');

const { loginUser } = require('../controllers/loginController');

const {
  verifyCode,
  toggleTwoStepVerification // import the new method
} = require('../controllers/verificationController');

const authMiddleware = require('../middleware/authMiddleware');

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

module.exports = router;
