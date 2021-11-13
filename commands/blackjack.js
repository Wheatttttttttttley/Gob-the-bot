const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { Game } = require('./blackjack-class/Game.js');
const { AccountManager } = require('../engine/account-manager.js');

const sleep = require('util').promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Start a game of blackjack!')
    .addNumberOption(option =>
        option.setName('bet')
            .setRequired(true)
            .setDescription('The amount of money you want to bet.'));

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(`:warning: ${title} :warning:`).setDescription(`**${description}**`).setColor(0xE74C3C)] };
}

async function execute(interaction) {
    const playerBet = interaction.options.getNumber('bet');
    // Check if bet is valid
    if (!Number.isInteger(playerBet) || playerBet < 0) {
        interaction.reply(warningEmbed('INVALID BET ALERT', 'Bet must be a *non-negative integer*'));
        return;
    }

    const player = await AccountManager.getAccount(interaction.user.id);
    if (player.balance < playerBet) {
        interaction.reply(warningEmbed('INSUFFICIENT FUNDS ALERT', `You don't have enough money to bet ${playerBet}`));
        return;
    }
    AccountManager.addBalance(interaction.user.id, -playerBet);

    // Create game
    const game = new Game(interaction, playerBet);
    const result = await game.gameRunner();
    await sleep(500);

    const resultEmbed = game.cardAndPointsEmbed();

    // Result of game
    switch (result) {
    case 'Win':
        AccountManager.addBalance(interaction.user.id, game.bet * 2);

        resultEmbed.addField(':tada: WIN :tada:', `***You won ${ game.bet }!***`)
            .setColor(0x57F287);
        break;
    case 'Blackjack':
        AccountManager.addBalance(interaction.user.id, Math.ceil(game.bet * 2.5));

        resultEmbed.addField(':tada: BLACKJACK :tada:', `***You got blackjack! You won ${ Math.ceil(game.bet * 1.5) }!***`)
            .setColor(0x57F287);
        break;
    case 'Draw':
        AccountManager.addBalance(interaction.user.id, game.bet * 1.0);

        resultEmbed.addField(':neutral_face: DRAW :neutral_face:', '***You got your bet back!***')
            .setColor(0x99AAB5);
        break;
    case 'Lose':
        resultEmbed.addField(':sob: LOSE :sob:', `***You lost ${game.bet}$!***`)
            .setColor(0xE74C3C);
        break;
    case 'Timeout':
        resultEmbed.addField(':sob: TIMEOUT :sob:', `***You didn't react in time! You lost ${game.bet}!***`)
            .setColor(0xE74C3C);
        break;
    case 'Surrender':
        AccountManager.addBalance(interaction.user.id, game.bet * 0.5);
        resultEmbed.addField(':sob: SURRENDER :sob:', `***You surrendered! You lost ${game.bet * 0.5}!***`)
            .setColor(0xE74C3C);
        break;
    }

    await game.sendEmbed(resultEmbed);
    AccountManager.updateRole(interaction.channel, interaction.user);
}

module.exports = {
    data: data,
    execute: execute,
};