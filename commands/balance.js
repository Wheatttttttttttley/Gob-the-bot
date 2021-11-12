const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const playerSchema = require('../schemas/playerSchema');

const data = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance!');

async function execute(interaction) {
    playerSchema.findOne({ _id: interaction.user.id })
        .then(player => {
            const embed = new MessageEmbed()
                .setTitle(`${interaction.user.username}'s balance`)
                .setDescription(`${player.balance} :dollar:`)
                .setColor(0x00AE86);
            interaction.reply({ embeds: [embed] });
        });
}

module.exports = {
    data: data,
    execute: execute,
};