const express = require('express')
const CustomerModel = require('../models/Customer')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const Customer = require('../models/Customer');

// Register a customer
const registerCustomer = async (req, res) => {
  const { name, username, password, email, address, phoneNumber } = req.body;

  try {
    // Check if username or email already exists
    const existingUser = await Customer.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // 🔐 Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    // Create and save the user with the hashed password
    const customer = new Customer({
      name,
      username,
      password: hashedPassword, // hashed password saved
      email,
      address,
      phoneNumber
    });

    await customer.save();
    res.status(201).json({ message: 'Customer registered successfully', customer });

  } catch (error) {
    console.error('Customer registration failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { registerCustomer };