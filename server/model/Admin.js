const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    profile: {
        type: String,
        default: 'https://example.com/default-profile.png' // Default profile image URL
    },
}, 
    { timestamps: true }
);

module.exports = mongoose.model('Admin', AdminSchema);
