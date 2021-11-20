import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, MessageEmbed, MessageReaction, Collection, User } from 'discord.js';
import { promisify } from 'util';
import { addBalance, addBalanceXP, getAccount } from '../../helpers/accountManager';
import { warningEmbed } from '../../helpers/warningHandler';

const sleep = promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('horse')
    .setDescription('Gambling in horse racing')
    .addNumberOption(option =>
        option.setName('bet')
            .setRequired(true)
            .setDescription('The amount of money you want to bet.'))
    .addNumberOption(option =>
        option.setName('horse-amount')
            .setRequired(false)
            .setDescription('The amount of horses in the races.')
            .addChoices([
                ['3', 3],
                ['6', 6],
                ['9', 9],
            ]));

class Horse {
    emoji : string;
    speed : number;
    progress : number;
    winning : boolean;
    constructor() {
        this.emoji = ['🦍', '🐆', '🐎', '🐑', '🐘', '🐅', '🐫', '🦄', '🐲'][Math.floor(Math.random() * 9)];
        this.speed = Math.floor(Math.random() * (12 - 5 + 1) + 5);
        this.progress = 0;
        this.winning = false;
    }

    run() {
        this.progress += this.speed;
        if (this.progress >= 100) {
            this.winning = true;
        }
    }
}

const numberToEmoji: {[key: number]: string} = { 1 : '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣' };
const emojiToNumber: {[key: string]: number} = { '1️⃣' : 1, '2️⃣' : 2, '3️⃣' : 3, '4️⃣' : 4, '5️⃣' : 5, '6️⃣' : 6, '7️⃣' : 7, '8️⃣' : 8, '9️⃣' : 9 };

const run = async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    const bet = interaction.options.getNumber('bet') || 0;
    const horseAmount = interaction.options.getNumber('horse-amount') || 6;
    const account = await getAccount(interaction.user.id);

    if (bet < 0 || !Number.isInteger(bet)) {
        interaction.editReply(warningEmbed({ title: 'INVALID BET ALERT', description: 'Bet must be a *non-negative integer*' }));
        return;
    } else if (bet > account.balance) {
        interaction.editReply(warningEmbed({ title: 'INSUFFICIENT FUNDS ALERT', description: `You don't have enough money to bet ${bet}` }));
        return;
    }

    addBalance(interaction.user.id, -bet);

    const horses = [] as Horse[];
    for (let i = 0; i < horseAmount; ++i) {
        horses.push(new Horse());
    }
    // TODO: Change this to a probability calculation instead of try 100000 games every time
    const testGameAmount = 100000;
    const winnerStats = Array.from({ length: horseAmount }, () => 0);
    for (let i = 0; i < testGameAmount; ++i) {
        while (true) {
            const runner = Math.floor(Math.random() * horseAmount);
            horses[runner].run();
            if (horses[runner].winning) {
                winnerStats[runner]++;
                for (let j = 0; j < horseAmount; ++j) {
                    horses[j].progress = 0;
                    horses[j].winning = false;
                }
                break;
            }
        }
    }
    const payRates = [] as number[];
    for (let i = 0; i < horseAmount; ++i) {
        const winRate = winnerStats[i] / testGameAmount;
        const lossRate = 1 - winRate;
        const payRate = Math.log10(1 + (lossRate / winRate));
        payRates.push(parseFloat(payRate.toFixed(2)));
    }

    // game init
    await interaction.editReply({
        embeds: [new MessageEmbed()
            .setTitle('🏇 Horse Racing! 🏇')
            .setColor(0x0099ff)
            .setDescription('Choose a horse to bet on')
            .addFields(
                ...horses.map((horse, i) => ({
                    name: `${i + 1} ${horse.emoji}`,
                    value: `⚡ : ${horse.speed}\n💰 : ${payRates[i].toFixed(2)}x`,
                    inline: true,
                })),
            ),
        ],
    });
    const message = (await interaction.fetchReply()) as Message;

    const numbersEmojiArray = [] as string[];
    // choose horse
    for (let i = 0; i < horseAmount; ++i) {
        message.react(numberToEmoji[i + 1]);
        numbersEmojiArray.push(numberToEmoji[i + 1]);
    }

    const emojiFilter = (reaction : MessageReaction, user : User) => {
        return user.id === interaction.user.id && numbersEmojiArray.includes(reaction.emoji.name as string);
    };

    let chosenHorse = -1;
    await message.awaitReactions({ filter: emojiFilter, max: 1, time: 60000, errors: ['time'] })
        .then(async (collected : Collection<string, MessageReaction>) => {
            const reaction = collected.first();
            chosenHorse = emojiToNumber[reaction?.emoji.name as string] || -1;
            await message.reactions.removeAll();
        })
        .catch(() => {
            message.reactions.removeAll();
        });
    if (chosenHorse === -1) {
        interaction.editReply(warningEmbed({ title: 'TIMEOUT ALERT', description: 'You didn\'t choose a horse in time' }));
        return;
    }

    const showProgress = async () => {
        await interaction.editReply({
            embeds: [new MessageEmbed()
                .setTitle('🏇 Horse Racing! 🏇')
                .setColor(0x0099ff)
                .setDescription(`You bet ${bet} 💵 on number **${numberToEmoji[chosenHorse]}** with rate **${payRates[chosenHorse - 1]}x**`)
                .addField('🚩 Field 🚩',
                    horses.map((horse, index) =>
                        `${`${numberToEmoji[index + 1]} ${'▰'.repeat(Math.floor(horse.progress / 10))}${horse.emoji}${'▱'.repeat(10 - Math.floor(horse.progress / 10))} **${horse.speed}** ⚡`}`,
                    ).join('\n'),
                ),
            ],
        });
    };

    // game runnings
    const loopShowProgress = setInterval(showProgress, 1000);

    let winner;
    while (true) {
        await sleep(300);
        const runner = Math.floor(Math.random() * horseAmount);
        horses[runner].run();
        if (horses[runner].winning) {
            winner = runner;
            clearInterval(loopShowProgress);
            break;
        }
    }
    const result = (chosenHorse - 1) === winner;

    if (result) {
        const payout = Math.ceil(bet * payRates[chosenHorse - 1]);
        addBalanceXP(interaction.user.id, bet + payout, payout);

        await interaction.editReply({
            embeds: [new MessageEmbed()
                .setTitle('🏇 WON! 🏇')
                .setColor(0x2ECC71)
                .setDescription(`You bet ${bet} 💵 on number **${numberToEmoji[chosenHorse]}** with rate **${payRates[chosenHorse - 1]}x**`)
                .addField('🚩 Field 🚩',
                    horses.map((horse, index) =>
                        `${`${numberToEmoji[index + 1]} ${'▰'.repeat(Math.floor(horse.progress / 10))}${horse.emoji}${'▱'.repeat(10 - Math.floor(horse.progress / 10))} **${horse.speed}** ⚡`}`,
                    ).join('\n'),
                ).addField('✅ You won! ✅', `You won **${payout}** 💵`),
            ],
        });
    } else {
        await interaction.editReply({
            embeds: [new MessageEmbed()
                .setTitle('🏇 LOST! 🏇')
                .setColor(0xE74C3C)
                .setDescription(`You bet ${bet} 💵 on number **${numberToEmoji[chosenHorse]}** with rate **${payRates[chosenHorse - 1]}x**`)
                .addField('🚩 Field 🚩',
                    horses.map((horse, index) =>
                        `${`${numberToEmoji[index + 1]} ${'▰'.repeat(Math.floor(horse.progress / 10))}${horse.emoji}${'▱'.repeat(10 - Math.floor(horse.progress / 10))} **${horse.speed}** ⚡`}`,
                    ).join('\n'),
                ).addField('❌ You lost! ❌', `You lost **${bet}** 💵`),
            ],
        });
    }
};

export default {
    data,
    run,
};