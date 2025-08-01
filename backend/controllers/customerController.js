const express = require('express')
const CustomerModel = require('../models/Customer')
const mongoose = require('mongoose')

const Customer = require('../models/Customer');

// Register a customer
const registerCustomer = async (req, res) => {
  try {
    const { name, username, password, email, address, phone } = req.body;

    const newCustomer = new Customer({ name, username, password, email, address, phone });
    await newCustomer.save();

    res.status(201).json({ message: 'Customer registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Customer registration failed' });
  }
};

// Export the Customercontroller function 
module.exports = {
  registerCustomer
};