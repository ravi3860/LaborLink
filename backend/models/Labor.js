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
    }
    
});

module.exports = mongoose.model('Labor', laborSchema);