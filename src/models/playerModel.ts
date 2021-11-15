import { model, Schema } from 'mongoose';

export interface PlayerInt {
    _id: string;
    balance: number;
    xp: number;
    level: number;
    xpToNextLevel: number;
    cooldown: {
        daily: Date,
    };
}
const PlayerModel = new Schema({
    _id: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
    xp : {
        type: Number,
        required: true,
        default: 0,
    },
    level : {
        type: Number,
        required: true,
        default: 1,
    },
    // min xp to next level = (2 * (level-1 ** 2) - (level-1) + 10) * 100
    xpToNextLevel : {
        type: Number,
        required: true,
        default: 1000,
    },
    cooldown : {
        daily : {
            type: Date,
        },
    },
});

export default model('Player', PlayerModel);