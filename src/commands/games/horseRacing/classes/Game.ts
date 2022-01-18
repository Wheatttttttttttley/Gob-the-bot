import { MessageEmbed } from "discord.js";
import { promisify } from "util";
import { clamp } from "../../../../helpers/clamp";
import { getPseudoRandom } from "../../../../helpers/randomNumber";
import { Horse } from "./Horse";

const sleep = promisify(setTimeout);

const numberToEmoji: { [key: number]: string } = {
  1: "1️⃣",
  2: "2️⃣",
  3: "3️⃣",
  4: "4️⃣",
  5: "5️⃣",
  6: "6️⃣",
  7: "7️⃣",
  8: "8️⃣",
  9: "9️⃣",
};

const payRates: { [key: string]: { [key: number]: number } } = {
  "555": { 5: 3.0 },
  "556": { 5: 2.9, 6: 3.23 },
  "557": { 5: 2.9, 7: 3.46 },
  "558": { 5: 2.74, 8: 3.69 },
  "566": { 5: 2.81, 6: 3.11 },
  "567": { 5: 2.74, 6: 3.0, 7: 3.31 },
  "568": { 5: 2.68, 6: 2.92, 8: 3.52 },
  "577": { 5: 2.68, 7: 3.19 },
  "578": { 5: 2.63, 7: 3.09, 8: 3.38 },
  "588": { 5: 2.58, 8: 3.26 },
  "666": { 6: 3.0 },
  "667": { 6: 2.91, 7: 3.19 },
  "668": { 6: 2.84, 8: 3.38 },
  "677": { 6: 2.84, 7: 3.09 },
  "678": { 6: 2.78, 7: 3.0, 8: 3.26 },
  "688": { 6: 2.72, 8: 3.16 },
  "777": { 7: 3.0 },
  "778": { 7: 2.93, 8: 3.16 },
  "788": { 7: 2.86, 8: 3.07 },
  "888": { 8: 3.0 },
};

export class Game {
  horses: Horse[] = [];
  horseAmount: number = 0;

  constructor(horseAmount: number) {
    this.horseAmount = horseAmount;
    for (let i = 0; i < horseAmount; i++) {
      this.horses.push(new Horse());
    }
    this.findPayRate();
  }

  async play(): Promise<number> {
    while (true) {
      await sleep(1000);
      const runner = getPseudoRandom(0, this.horseAmount - 1);
      this.horses[runner].run();
      if (this.horses[runner].progress >= 100) {
        return runner;
      }
    }
  }

  getProgressEmbed(bet: number, chosenHorse: number): MessageEmbed {
    return new MessageEmbed()
      .setTitle("🏇 Horse Racing! 🏇")
      .setColor(0x0099ff)
      .setDescription(
        `You bet ${bet} 💵 on number **${
          numberToEmoji[chosenHorse]
        }** with rate **${this.horses[chosenHorse - 1].pay}x**`,
      )
      .addField(
        "🚩 Field 🚩",
        this.horses
          .map(
            (horse, index) =>
              `${`${numberToEmoji[index + 1]} ${"▰".repeat(
                clamp(Math.floor(horse.progress / 10), 0, 10),
              )}${horse.emoji}${"▱".repeat(
                clamp(10 - Math.floor(horse.progress / 10), 0, 10),
              )} **${horse.speed}** ⚡`}`,
          )
          .join("\n"),
      );
  }

  findPayRate(): void {
    let key: number[] | string = [];
    for (let i = 0; i < this.horseAmount; ++i) {
      key.push(Math.ceil(100 / this.horses[i].speed));
    }
    key = key.sort().join("");
    for (let i = 0; i < this.horseAmount; ++i) {
      const num = Math.ceil(100 / this.horses[i].speed);
      this.horses[i].pay = parseFloat(
        (payRates[key][num] + getPseudoRandom(-10, 10) / 100).toFixed(2),
      );
    }
  }
}
