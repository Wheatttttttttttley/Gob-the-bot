import { model, Schema } from 'mongoose';

export interface PlayerInt {
    _id: string;
    balance: number;
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
});

export default model('Player', PlayerModel);