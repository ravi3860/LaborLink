const express = require('express');
const { 
  registerCustomer 
} = require('../controllers/customerController');
const { 
  registerLabor,
  getLaborDashboardData
} = require('../controllers/laborController');

const { loginUser 
} = require('../controllers/loginController');

const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

// Route for registering a customer    
router.post('/register/customer', registerCustomer);

// Route for registering a labor
router.post('/register/labor', registerLabor);

// POST /api/login
router.post('/login', loginUser);

// Protected route: Get customer dashboard data
router.get('/customer/dashboard', authMiddleware.verifyCustomer, require('../controllers/customerController').getDashboardData);

// Protected route: Get labor dashboard data
router.get('/labor/dashboard', authMiddleware.verifyLabor, getLaborDashboardData);

module.exports = router;