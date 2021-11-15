import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { addBalance, addXP, getAccount } from '../../handlers/account-manager';
import { warningEmbed } from '../../handlers/warningHandler';

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
        .addField('Bot choice', `:**${{ 'r' : 'ROCK 👊', 'p' : 'PAPER ✋', 's': 'SCISSORS ✌' }[botChoice]}**`, true);

    if (result === 'draw') {
        embed.addField('😐 DRAW 😐', '***You got your bet back!***').setColor(0x99AAB5);
        addXP(interaction.user.id, Math.ceil(bet * 0.5));
    } else if (result === 'win') {
        embed.addField('🎉 WIN 🎉', `***You won ${ bet }!***`)
            .setColor(0x57F287);
        addBalance(interaction.user.id, bet);
        addXP(interaction.user.id, bet);
    } else if (result === 'lose') {
        embed.addField('😭 LOSE 😭', `***You lost ${bet}$!***`);
        addBalance(interaction.user.id, -bet);
    }

    interaction.reply({ embeds: [embed] });
}

export default {
    data,
    run,
};