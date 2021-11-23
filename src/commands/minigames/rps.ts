import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { addBalance, addBalanceXP, addXP, getAccount } from '../../helpers/accountManager';
import { warningEmbed } from '../../helpers/warningHandler';

const data = new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play a game of rock, paper, scissors with the bot.')
    .addNumberOption(option =>
        option.setName('bet')
            .setRequired(true)
            .setDescription('The amount of money you want to bet.'))
    .addStringOption(option =>
        option.setName('choice')
            .setRequired(true)
            .setDescription('your choice')
            .addChoice('rock', 'r')
            .addChoice('paper', 'p')
            .addChoice('scissors', 's'));

async function run(interaction: CommandInteraction) {
    const bet = interaction.options.getNumber('bet') || 0;
    const yourChoice = interaction.options.getString('choice') || '';

    const account = await getAccount(interaction.user.id);

    if (bet < 0 || !Number.isInteger(bet)) {
        interaction.reply(warningEmbed({ title: 'INVALID BET ALERT', description: 'Bet must be a *non-negative integer*' }));
        return;
    } else if (bet > account.balance) {
        interaction.reply(warningEmbed({ title: 'INSUFFICIENT FUNDS ALERT', description: `You don't have enough money to bet ${bet}` }));
        return;
    } else if (bet < account.balance / 10) {
        interaction.reply(warningEmbed({ title: 'TOO LOW BET', description: 'You can\'t bet less than 10% of your current balance' }));
        return;
    }

    const botChoice = ['r', 'p', 's'][Math.floor(Math.random() * 3)];

    const result = {
        ['r' as string]: {
            'r': 'draw',
            'p': 'lose',
            's': 'win',
        },
        'p': {
            'r': 'win',
            'p': 'draw',
            's': 'lose',
        },
        's': {
            'r': 'lose',
            'p': 'win',
            's': 'draw',
        },
    }[yourChoice][botChoice];

    const embed = new MessageEmbed()
        .setTitle('👊✋✌ Rock, Paper, Scissors 👊✋✌')
        .addField('Your choice', `**${{ 'r' : 'ROCK 👊', 'p' : 'PAPER ✋', 's': 'SCISSORS ✌' }[yourChoice]}**`, true)
        .addField('Bot choice', `**${{ 'r' : 'ROCK 👊', 'p' : 'PAPER ✋', 's': 'SCISSORS ✌' }[botChoice]}**`, true);

    if (result === 'draw') {
        addXP(interaction.user.id, bet * 0.5);
        embed.addField('😐 DRAW 😐', '***You got your bet back!***').setColor(0x99AAB5);
    } else if (result === 'win') {
        addBalanceXP(interaction.user.id, bet, bet);
        embed.addField('🎉 WIN 🎉', `You won **${bet}** 💵`).setColor(0x57F287);
    } else if (result === 'lose') {
        addBalance(interaction.user.id, -bet);
        embed.addField('😭 LOSE 😭', `You lost **${bet}** 💵`).setColor(0xE74C3C);
    }

    interaction.reply({ embeds: [embed] });
}

export default {
    data,
    run,
};