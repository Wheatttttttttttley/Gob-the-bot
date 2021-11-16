import { Card } from './Card';

export class Deck {
    cards: Card[];
    private suits: string[];
    private ranks: string[];
    private values: number[];
    constructor() {
        this.suits = ['H', 'D', 'S', 'C'];
        this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        this.cards = [];
        this.createDeck();
    }

    private createDeck() {
        for (let i = 0; i < this.suits.length; i++) {
            for (let j = 0; j < this.ranks.length; j++) {
                this.cards.push(new Card(this.suits[i], this.ranks[j], this.values[j]));
            }
        }
    }

    public shuffle() {
        let m = this.cards.length, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            this.cards[m], this.cards[i] = (this.cards[i], this.cards[m]);
        }
    }

    public deal(amount: number) {
        const hand = [];
        for (let i = 0; i < amount; i++) {
            hand.push(this.cards.pop());
        }
        return hand;
    }
}