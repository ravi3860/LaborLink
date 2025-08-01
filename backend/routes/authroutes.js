const express = require('express');
const { 
  registerCustomer 
} = require('../controllers/customerController');
const { 
  registerLabor 
} = require('../controllers/laborController');

const router = express.Router();

// Route for registering a customer    
router.post('/register/customer', registerCustomer);

// Route for registering a labor
router.post('/register/labor', registerLabor);

module.exports = router;