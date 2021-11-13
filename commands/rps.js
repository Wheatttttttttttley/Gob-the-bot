const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { AccountManager } = require('../src/account-manager.js');

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

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(`:warning: ${title} :warning:`).setDescription(`**${description}**`).setColor(0xE74C3C)] };
}

async function execute(interaction) {
    const bet = interaction.options.getNumber('bet');
    const yourChoice = interaction.options.getString('choice');

    const account = await AccountManager.getAccount(interaction.user.id);

    if (bet < 0 || !Number.isInteger(bet)) {
        interaction.reply(warningEmbed('INVALID BET ALERT', 'Bet must be a *non-negative integer*'));
        return;
    } else if (bet > account.balance) {
        interaction.reply(warningEmbed('INSUFFICIENT FUNDS ALERT', `You don't have enough money to bet ${bet}`));
        return;
    }

    const botChoice = ['r', 'p', 's'][Math.floor(Math.random() * 3)];

    const result = {
        'r': {
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
        embed.addField(':neutral_face: DRAW :neutral_face:', '***You got your bet back!***').setColor(0x99AAB5);
    } else if (result === 'win') {
        embed.addField(':tada: WIN :tada:', `***You won ${ bet }!***`)
            .setColor(0x57F287);
        AccountManager.addBalance(interaction.user.id, bet);
    } else if (result === 'lose') {
        embed.addField(':sob: LOSE :sob:', `***You lost ${bet}$!***`);
        AccountManager.addBalance(interaction.user.id, -bet);
    }

    interaction.reply({ embeds: [embed] });
}

module.exports = {
    data: data,
    execute: execute,
};