import { getPseudoRandom } from "../../../../helpers/randomNumber";

const rankList = [
  "🅰",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
  ":regional_indicator_j:",
  ":regional_indicator_q:",
  ":regional_indicator_k:",
];

export class Card {
  suit: string = "";
  value: number = 0;
  rank: string = "";
  isFaceUp: boolean;
  constructor(isFaceUp = true) {
    const randomNumber = getPseudoRandom(0, 51);
    this.suit = ["♣️", "♦️", "♥️", "♠️"][randomNumber % 4];
    this.value = randomNumber % 13;
    this.rank = rankList[this.value];

    this.isFaceUp = isFaceUp;
  }
}
