const mongoose = require('mongoose');

const laborSchema = new mongoose.Schema({
    name: {
        type: String,   
        required: true
    },
    username: {
        type: String,   
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    ageCategory: { 
        type: String, 
        required: true,
        enum: ['Young Adults', 'Adults', 'Middle-aged Workers', 'Senior Workers']
    },
    
    skillCategory: { 
        type: String, 
        required: true,
        enum: ['Masons', 'Electricians', 'Plumbers', 'Painters', 'Carpenters', 'Tile Layers', 'Welders', 'Roofers', 'Helpers/General Labourers', 'Scaffolders']
    },

     description: {   
        type: String,
        required: false,
        maxlength: 500
    },

    yearsOfExperience: {
        type: Number,
        required: false,
        default: 0
    },
    projects: [
        {
            projectName: 
            { 
                type: String, 
                required: false 
            },

            description: 
            { 
                type: String, 
                required: false 
            }
        }
    ],

    paymentType: {
        type: String,
        enum: ['Hourly', 'Daily'],
        required: false
    },

    paymentRate: {
        type: Number,
        required: false
    }

});

module.exports = mongoose.model('Labor', laborSchema);
