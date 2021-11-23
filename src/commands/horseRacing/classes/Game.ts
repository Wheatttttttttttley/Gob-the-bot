import { MessageEmbed } from 'discord.js';
import { promisify } from 'util';
import { Horse } from './Horse';

const sleep = promisify(setTimeout);

const numberToEmoji: {[key: number]: string} = { 1 : '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣' };
export class Game {
    horses: Horse[] = [];
    horseAmount = 0;
    constructor(horseAmount : number) {
        this.horseAmount = horseAmount;
        for (let i = 0; i < horseAmount; i++) {
            this.horses.push(new Horse());
        }
        this.findPayRate();
    }

    async play(): Promise<number> {
        while (true) {
            await sleep(200);
            const runner = Math.floor(Math.random() * this.horseAmount);
            await this.horses[runner].run();
            if (this.horses[runner].winning) {
                return runner;
            }
        }
    }

    getProgressEmbed(bet : number, chosenHorse : number) {
        return new MessageEmbed()
            .setTitle('🏇 Horse Racing! 🏇')
            .setColor(0x0099ff)
            .setDescription(`You bet ${bet} 💵 on number **${numberToEmoji[chosenHorse]}** with rate **${this.horses[chosenHorse - 1].pay}x**`)
            .addField('🚩 Field 🚩',
                this.horses.map((horse, index) =>
                    `${`${numberToEmoji[index + 1]} ${'▰'.repeat(Math.floor(horse.progress / 10))}${horse.emoji}${'▱'.repeat(10 - Math.floor(horse.progress / 10))} **${horse.speed}** ⚡`}`,
                ).join('\n'),
            );
    }

    // TODO: Change this to probability calculation instead of trying out 100000 times
    findPayRate() {
        for (let i = 0; i < this.horseAmount; i++) {
            this.horses[i].pay = this.horseAmount - 1;
        }
        // const testGameAmount = 10000;
        // const winnerStats = Array(this.horseAmount).fill(0);
        // for (let i = 0; i < testGameAmount; i++) {
        //     const winner = this.play();
        //     winnerStats[winner]++;
        //     for (let j = 0; j < this.horseAmount; j++) {
        //         this.horses[j].progress = 0;
        //         this.horses[j].winning = false;
        //     }
        // }
        // for (let i = 0; i < this.horseAmount; i++) {
        //     const winChance = winnerStats[i] / testGameAmount;
        //     const loseChance = 1 - winChance;
        //     this.horses[i].pay = parseFloat((Math.log(2 + (loseChance / winChance)) ** 2).toFixed(2));
        // }
    }
}