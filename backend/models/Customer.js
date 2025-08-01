const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },

    username : {
        type: String,   
        required: true,
        unique: true
    },

    password : {
        type: String,
        required: true
    },

    email : {
        type: String,
        required: true,
        unique: true
    },

    phone : {
        type: String,
        required: true
    },

    address : {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('Customer', CustomerSchema);