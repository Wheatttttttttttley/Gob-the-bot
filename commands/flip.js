const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { AccountManager } = require('../engine/account-manager.js');

const sleep = require('util').promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('flip')
    .setDescription('Flip a coin!')
    .addNumberOption(option =>
        option.setName('bet')
            .setRequired(true)
            .setDescription('The amount of money you want to bet.'))
    .addStringOption(option =>
        option.setName('side')
            .setRequired(true)
            .setDescription('The side you want to bet on.')
            .addChoice('heads', 'h')
            .addChoice('tails', 't'));

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(`:warning: ${title} :warning:`).setDescription(`**${description}**`).setColor(0xE74C3C)] };
}

async function execute(interaction) {
    const bet = interaction.options.getNumber('bet');
    const side = interaction.options.getString('side');
    const account = await AccountManager.getAccount(interaction.user.id);

    if (bet < 0 || !Number.isInteger(bet)) {
        interaction.reply(warningEmbed('INVALID BET ALERT', 'Bet must be a *non-negative integer*'));
        return;
    } else if (bet > account.balance) {
        interaction.reply(warningEmbed('INSUFFICIENT FUNDS ALERT', `You don't have enough money to bet ${bet}`));
        return;
    }

    const embed = new MessageEmbed()
        .setTitle(':game_die: Coin flipping :game_die:')
        .setDescription(`You bet **${bet}** on **${side === 'h' ? 'heads' : 'tails'}**`)
        .setColor(0xE91E63);
    await interaction.reply({ embeds: [embed] });
    AccountManager.addBalance(interaction.user.id, -bet);

    await sleep(1500);

    const rndSide = Math.random() < 0.5 ? 'h' : 't';
    const result = rndSide === side ? 'win' : 'lose';

    embed.setTitle(`:game_die: ${result.toUpperCase()}! :game_die:`)
        .setDescription(rndSide === 'h' ? '**HEADS** 🌝' : '**TAILS** 🌚');
    if (result === 'win') {
        embed.addField(':white_check_mark: You won! :white_check_mark:', `You won **${bet}**💵`).setColor(0x2ECC71);
        AccountManager.addBalance(interaction.user.id, 2 * bet);
    } else if (result === 'lose') {
        embed.addField(':x: You lost! :x:', `You lost **${bet}**💵`).setColor(0xE74C3C);
    }
    await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    data: data,
    execute: execute,
};