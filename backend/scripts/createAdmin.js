const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin'); 

// Replace with your actual MongoDB URI
const MONGO_URI = 'mongodb+srv://MERNdatabase:1234ravi@cluster0.keprk3l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10); 
    const admin = new Admin({
      username: 'admin',
      password: hashedPassword
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error connecting or creating admin:', err);
  });