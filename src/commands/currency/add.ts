import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { addBalance } from '../../helpers/accountManager';

const data = new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add balance to your account')
    .addNumberOption(options =>
        options.setName('amount')
            .setDescription('Amount to add to your balance')
            .setRequired(true))
    .addUserOption(options =>
        options.setName('user')
            .setDescription('User to add balance to')
            .setRequired(false))
    .addBooleanOption(options =>
        options.setName('silent')
            .setDescription('Silent mode')
            .setRequired(false));

const run = async (interaction: CommandInteraction): Promise<void> => {
    const toUser = interaction.options.getUser('user') ?? interaction.user;
    const amount = interaction.options.getNumber('amount') ?? 0;
    const silent = interaction.options.getBoolean('silent') ?? false;

    addBalance(toUser.id, amount);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('💸 Balance Added 💸')
            .setDescription(`**${toUser.username}'s** balance has been added by **${interaction.user.username}**`)
            .addField('Amount', `**💵 : ${amount}**`)
            .setColor(0x57F287),
    ], ephemeral: silent });
};

export default {
    data,
    ownerOnly: true,
    run,
};