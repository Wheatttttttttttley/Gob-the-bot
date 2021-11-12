const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { AccountManager } = require('../src/account-manager.js');

const data = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance!')
    .addUserOption(options =>
        options.setName('user')
            .setDescription('The user to check the balance of.'));

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(':warning: ' + title + ' :warning:').setDescription('**' + description + '**').setColor(0xE74C3C)] };
}

async function execute(interaction) {
    const user = interaction.options?.getUser('user') || interaction.user;

    AccountManager.getBalance(user)
        .then(balance => {
            const balanceEmbed = new MessageEmbed()
                .setTitle(`:moneybag: Balance of ${user.username} :moneybag:`)
                .setColor(0x2ECC71)
                .setDescription(`**:dollar: : ${balance}**`);
            interaction.reply({ embeds: [balanceEmbed] });

        }).catch(err => {
            interaction.reply(warningEmbed('Error', err));
        });
}

module.exports = {
    data: data,
    execute: execute,
};