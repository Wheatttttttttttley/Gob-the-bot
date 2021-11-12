const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const playerSchema = require('../schemas/playerSchema');

const data = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance!')
    .addUserOption(options =>
        options.setName('user')
            .setDescription('The user to check the balance of.'));

const warningEmbed = new MessageEmbed()
    .setTitle(':warning:ALERT:warning:')
    .setColor(0xE74C3C);

async function execute(interaction) {
    let id = interaction.user.id;
    try {
        id = interaction.options.getUser('user').id;
    } catch {
        // Do nothing
    }
    playerSchema.findOne({ _id: id })
        .then(player => {
            if (!player) {
                warningEmbed.setDescription('Gob can\'t find the account. Please try again.');
                interaction.reply({ embeds: [warningEmbed] });
                return;
            }
            const balanceEmbed = new MessageEmbed()
                .setTitle(`${interaction.user.username}'s balance`)
                .setColor(0x2ECC71)
                .setDescription(`:dollar:: ${player.balance}`);

            interaction.reply({ embeds: [balanceEmbed] });
        })
        .catch(console.error);
}

module.exports = {
    data: data,
    execute: execute,
};