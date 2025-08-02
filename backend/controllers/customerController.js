const express = require('express')
const Customer = require('../models/Customer');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

// Register a customer
const registerCustomer = async (req, res) => {
  const { name, username, password, email, address, phone } = req.body;

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
      phone
    });

    await customer.save();
    res.status(201).json({ message: 'Customer registered successfully', customer });

  } catch (error) {
    console.error('Customer registration failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get customer dashboard data
const getDashboardData = async (req, res) => {
  try {
    const customerId = req.user.id;

    const customer = await Customer.findById(customerId).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      message: 'Customer dashboard data fetched successfully',
      customer,
    });
  } catch (error) {
    console.error('Error fetching customer dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/customers/update
const updateCustomer = async (req, res) => {
  try {
    const { _id, name, email, username, address, phone } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      _id,
      { name, email, username, address, phone },
      { new: true }
    );
    res.json({ success: true, updatedCustomer });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update details' });
  }
};

// DELETE /api/customers/delete/:id
const deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
};

module.exports = { registerCustomer, 
                   getDashboardData,
                   updateCustomer,
                   deleteCustomer };