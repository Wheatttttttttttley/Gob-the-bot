import { MessageEmbed } from "discord.js";
import { promisify } from "util";
import { clamp } from "../../../../helpers/clamp";
import { getPseudoRandom } from "../../../../helpers/randomNumber";
import { Horse } from "./Horse";
import { payRates } from "./PayRates";

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

export class HorseGame {
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
        `You bet ${bet.toLocaleString()} 💵 on number **${numberToEmoji[chosenHorse]}** with rate **${
          this.horses[chosenHorse - 1].pay
        }x**`,
      )
      .addField(
        "🚩 Field 🚩",
        this.horses
          .map(
            (horse, index) =>
              `${`${numberToEmoji[index + 1]} ${"▰".repeat(clamp((horse.progress / 10) >> 0, 0, 10))}${
                horse.emoji
              }${"▱".repeat(clamp(10 - ((horse.progress / 10) >> 0), 0, 10))} **${horse.speed}** ⚡`}`,
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
        (payRates[key][num] + getPseudoRandom(-5 * this.horseAmount, 5 * this.horseAmount) / 100).toFixed(2),
      );
    }
  }
}
