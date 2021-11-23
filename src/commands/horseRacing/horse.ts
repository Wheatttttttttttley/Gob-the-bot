import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import { addBalance, addBalanceXP, getAccount } from '../../helpers/accountManager';
import { warningEmbed } from '../../helpers/warningHandler';
import { Game } from './classes/Game';

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

const numberToEmoji: {[key: number]: string} = { 1 : '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣' };
const emojiToNumber: {[key: string]: number} = { '1️⃣' : 1, '2️⃣' : 2, '3️⃣' : 3, '4️⃣' : 4, '5️⃣' : 5, '6️⃣' : 6, '7️⃣' : 7, '8️⃣' : 8, '9️⃣' : 9 };

const run = async (interaction : CommandInteraction) => {
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
    } else if (bet < account.balance / 10) {
        interaction.reply(warningEmbed({ title: 'TOO LOW BET', description: 'You can\'t bet less than 10% of your current balance' }));
        return;
    }

    addBalance(interaction.user.id, -bet);

    const game = new Game(horseAmount);

    await interaction.editReply({
        embeds: [new MessageEmbed()
            .setTitle('🏇 Horse Racing! 🏇')
            .setColor(0x0099ff)
            .setDescription('Choose a horse to bet on')
            .addFields(
                ...game.horses.map((horse, i) => ({
                    name: `${i + 1} ${horse.emoji}`,
                    value: `⚡ : ${horse.speed}\n💰 : ${horse.pay.toFixed(2)}x`,
                    inline: true,
                })),
            ),
        ],
    });
    const message = (await interaction.fetchReply() as Message);
    for (let i = 0; i < horseAmount; i++) {
        await message.react(numberToEmoji[i + 1]);
    }

    const numberEmojiArray = Object.values(numberToEmoji).slice(0, horseAmount);
    let horseNumber = -1;

    const filter = (reaction: MessageReaction, user: User) => numberEmojiArray.includes(reaction.emoji.name as string) && user.id === interaction.user.id;
    await message.awaitReactions({ filter, time: 60000, max : 1 }).then(async (reactions) => {
        const reaction = reactions.first();
        horseNumber = emojiToNumber[reaction?.emoji.name as string];
    }).catch(() => {
        horseNumber = -1;
    });

    await message.reactions.removeAll();
    if (horseNumber === -1) {
        interaction.editReply(warningEmbed({ title: 'TIMEOUT ALERT', description: 'You did not choose a horse in time.' }));
        return;
    }

    const showProgressInterval = setInterval(() => {
        interaction.editReply({
            embeds: [game.getProgressEmbed(bet, horseNumber)],
        });
    }, 750);
    const winner = await game.play();
    clearInterval(showProgressInterval);
    const result = winner === (horseNumber - 1) ? 'won' : 'lost';
    const payout = result === 'won' ? game.horses[horseNumber - 1].pay * bet : 0;
    addBalanceXP(interaction.user.id, result === 'won' ? bet + payout : 0, payout);

    await interaction.editReply({
        embeds: [new MessageEmbed()
            .setTitle(`🏇 ${result.toUpperCase()} ! 🏇`)
            .setColor(result === 'won' ? 0x2ECC71 : 0xE74C3C)
            .setDescription(`You bet ${bet} 💵 on number **${numberToEmoji[horseNumber]}** with rate **${game.horses[horseNumber - 1].pay}x**`)
            .addField('🚩 Field 🚩',
                game.horses.map((horse, index) =>
                    `${`${numberToEmoji[index + 1]} ${'▰'.repeat(Math.floor(horse.progress / 10))}${horse.emoji}${'▱'.repeat(10 - Math.floor(horse.progress / 10))} **${horse.speed}** ⚡`}`,
                ).join('\n'),
            ).addField(`${result === 'won' ? '✅' : '❌'} You ${result}! ${result === 'won' ? '✅' : '❌'}`, `You ${result} **${payout ? payout : bet}** 💵`),
        ],
    });
};

export default {
    data,
    run,
};