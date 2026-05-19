const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links the token to a specific user
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically deletes the token after 30 days
    }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);