const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true 
},  

  password: { 
    type: String, 
    required: true 
  },

  role: { 
    type: String, 
    default: 'Admin' 
  }
});

// Export model
module.exports = mongoose.model('Admin', adminSchema);
