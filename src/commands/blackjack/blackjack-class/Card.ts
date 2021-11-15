export class Card {
    suit: string;
    value: number;
    rank: string;
    isFaceUp: boolean;
    constructor(isFaceUp = true) {
        this.suit = ['♣️', '♦️', '♥️', '♠️'][Math.floor(Math.random() * 4)];
        this.value = Math.floor(Math.random() * 13);
        this.rank = ['🅰', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', ':regional_indicator_j:', ':regional_indicator_q:', ':regional_indicator_k:'][this.value];

        this.isFaceUp = isFaceUp;
    }
}