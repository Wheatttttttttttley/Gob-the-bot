const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('Player', playerSchema);