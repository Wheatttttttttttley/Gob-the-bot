const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { AccountManager } = require('../../engine/account-manager.js');

const data = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance!')
    .addUserOption(options =>
        options.setName('user')
            .setDescription('The user to check the balance of.'));

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [
        new MessageEmbed()
            .setTitle(`⚠ ${title} ⚠`)
            .setDescription(`**${description}**`)
            .setColor(0xE74C3C)],
    };
}

async function execute(interaction) {
    const user = interaction.options?.getUser('user') || interaction.user;

    AccountManager.getAccount(user.id)
        .then(player => {
            interaction.reply({ embeds: [
                new MessageEmbed()
                    .setTitle(`💰 Balance of ${user.username} 💰`)
                    .setColor(0x2ECC71)
                    .setDescription(`**💵 : ${player.balance}**`)],
            });

        }).catch(err => {
            interaction.reply(warningEmbed('ERROR', err));
        });
}

module.exports = {
    data: data,
    execute: execute,
};