import { model, Schema } from 'mongoose';

export interface PlayerInt {
    _id: string;
    balance: number;
    xp: number;
    level: number;
    cooldown: {
        daily: Date,
    },
}
// level: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...
// xp: 0, 100, 110, 160, 250, 380, 550, 760, 1010, 1300, ...
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
    // min xp to next level = 20 * level**2  - 10 * x + 100
    level : {
        type: Number,
        required: true,
        default: 1,
    },
    cooldown : {
        daily : {
            type: Date,
        },
    },
});

export default model('Player', PlayerModel);