const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { AccountManager } = require('../../engine/account-manager.js');

const data = new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfers money to another user')
    .addUserOption(options =>
        options.setName('to')
            .setDescription('The user to transfer the money to')
            .setRequired(true))
    .addNumberOption(options =>
        options.setName('amount')
            .setRequired(true)
            .setDescription('The amount to transfer.'));

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [
        new MessageEmbed()
            .setTitle(`⚠ ${title} ⚠`)
            .setDescription(`**${description}**`)
            .setColor(0xE74C3C)],
    };
}

async function execute(interaction) {
    const fromPlayer = interaction.user;
    const toPlayer = interaction.options.getUser('to');

    if (fromPlayer.id === toPlayer?.id || toPlayer === undefined) {
        interaction.reply(warningEmbed('INVALID USER', 'You cannot transfer money to yourself!'));
        return;
    }

    const amount = interaction.options.getNumber('amount');

    if (amount <= 0 || !Number.isInteger(amount)) {
        interaction.reply(warningEmbed('INVALID AMOUNT', 'You can transfer only a positive integer!'));
        return;
    }

    const fromAccount = await AccountManager.getAccount(fromPlayer.id);
    const toAccount = await AccountManager.getAccount(toPlayer.id);

    if (fromAccount === undefined || toAccount === undefined) {
        interaction.reply(warningEmbed('INVALID USER', 'One of the users does not have an account!'));
        return;
    }

    if (fromAccount.balance < amount) {
        interaction.reply(warningEmbed('INSUFFICIENT FUNDS', 'You do not have enough money to transfer!'));
        return;
    }

    AccountManager.addBalance(fromPlayer.id, -amount);
    AccountManager.addBalance(toPlayer.id, amount);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('💸 TRANSFER 💸')
            .setDescription(`**${fromPlayer.username}** transferred **${amount}** 💵 to **${toPlayer.username}**`)
            .setColor(0x2ECC71)],
    });
}

module.exports = {
    data: data,
    execute: execute,
};