import { Schema, model } from 'mongoose';

const DailyRewardModel = new Schema({
    _id: {
        type: String,
        required: true,
    },
},
{
    timestamps: true,
});

export default model('daily-reward', DailyRewardModel);