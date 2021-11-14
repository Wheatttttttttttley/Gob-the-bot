const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { AccountManager } = require('../../engine/account-manager.js');

const sleep = require('util').promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('highlow')
    .setDescription('Guess the number is high[6-10] or low[1-5].')
    .addNumberOption(option =>
        option.setName('bet')
            .setRequired(true)
            .setDescription('The amount of money you want to bet.'))
    .addStringOption(option =>
        option.setName('guess')
            .setRequired(true)
            .setDescription('your guess')
            .addChoice('high', 'high')
            .addChoice('low', 'low'));

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(`:warning: ${title} :warning:`).setDescription(`**${description}**`).setColor(0xE74C3C)] };
}

async function execute(interaction) {
    const bet = interaction.options.getNumber('bet');
    const guess = interaction.options.getString('guess');
    const account = await AccountManager.getAccount(interaction.user.id);

    if (bet < 0 || !Number.isInteger(bet)) {
        interaction.reply(warningEmbed('INVALID BET ALERT', 'Bet must be a *non-negative integer*'));
        return;
    } else if (bet > account.balance) {
        interaction.reply(warningEmbed('INSUFFICIENT FUNDS ALERT', `You don't have enough money to bet ${bet}`));
        return;
    }

    const embed = new MessageEmbed()
        .setTitle(':game_die: High/Low :game_die:')
        .setDescription(`You bet **${bet}$** and guessed **${guess}**`)
        .setColor(0xFFFF00);
    await interaction.reply({ embeds: [embed] });
    AccountManager.addBalance(interaction.user.id, -bet);

    await sleep(1500);
    const rndNumber = Math.floor(Math.random() * 10) + 1;

    const result = rndNumber > 5 ? 'high' : 'low';

    if (result === guess) {
        embed.setTitle(':tada: YOU WIN :tada:')
            .setColor(0x2ECC71)
            .setDescription(`The number was **${rndNumber}\nYou won ${bet} 💵**`);
        AccountManager.addBalance(interaction.user.id, bet * 2);
    } else {
        embed.setTitle(':sob: YOU LOSE :sob:')
            .setColor(0xE74C3C)
            .setDescription(`The number was **${rndNumber}\nYou lost ${bet} 💵**`);
    }
    await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    data: data,
    execute: execute,
};