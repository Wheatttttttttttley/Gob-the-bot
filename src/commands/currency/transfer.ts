import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { addBalance, getAccount } from '../../handlers/account-manager';
import { warningEmbed } from '../../handlers/warningHandler';

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

async function run(interaction: CommandInteraction) {
    const fromPlayer = interaction.user;
    const toPlayer = interaction.options.getUser('to') || interaction.user;

    if (fromPlayer.id === toPlayer.id || toPlayer === undefined) {
        interaction.reply(warningEmbed({ title: 'INVALID USER', description: 'You cannot transfer money to yourself!' }));
        return;
    }

    const amount = interaction.options.getNumber('amount') || 0;

    if (amount <= 0 || !Number.isInteger(amount)) {
        interaction.reply(warningEmbed({ title: 'INVALID AMOUNT', description: 'You can transfer only a positive integer!' }));
        return;
    }

    const fromAccount = await getAccount(fromPlayer.id);
    const toAccount = await getAccount(toPlayer.id);

    if (fromAccount === undefined || toAccount === undefined) {
        interaction.reply(warningEmbed({ title: 'INVALID USER', description: 'One of the users does not have an account!' }));
        return;
    }

    if (fromAccount.balance < amount) {
        interaction.reply(warningEmbed({ title: 'INSUFFICIENT FUNDS', description: 'You do not have enough money to transfer!' }));
        return;
    }

    addBalance(fromPlayer.id, -amount);
    addBalance(toPlayer.id, amount);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('💸 TRANSFER 💸')
            .setDescription(`**${fromPlayer.username}** transferred **${amount}** 💵 to **${toPlayer.username}**`)
            .setColor(0x2ECC71)],
    });
}

export default {
    data,
    run,
};