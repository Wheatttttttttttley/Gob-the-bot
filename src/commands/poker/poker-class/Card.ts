export class Card {
    suit: string;
    rank: string;
    value: number;
    constructor(suit: string, rank: string, value: number) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
    }
}