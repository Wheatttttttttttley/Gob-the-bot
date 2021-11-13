const mongoose = require('mongoose');

const dailyRewardSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
},
{
    timestamps: true,
});

module.exports = mongoose.model('daily-reward', dailyRewardSchema);