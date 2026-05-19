const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,   // Removes accidental whitespace
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true // Normalizes email for lookups
    },
    password: {
        type: String,
        required: true,
        minlength: 8 // Enforces basic security
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Restricts values
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);